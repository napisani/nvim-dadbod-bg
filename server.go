package main

import (
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/napisani/nvim-dadbod-bg/parse"
	"github.com/napisani/nvim-dadbod-bg/results"
)

var (
	//go:embed web/dist/*
	web    embed.FS
	server Server
)

type WebSocketRequest struct {
	Action string `json:"action"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Accepting all requests
	},
}

type Server struct {
	clients map[*websocket.Conn]bool
	rwMutex sync.RWMutex
	dist    fs.FS
}

func handleWebSocketMessage(message []byte, conn *websocket.Conn) {
	req := WebSocketRequest{}

	err := json.Unmarshal(message, &req)
	if err != nil {
		log.Fatal("Error reading json.", err)
	}

	log.Println("Got message: \n", req)
	if req.Action == "QUERY_RESULTS" {
		log.Println("Sending query results")
		queryResults := results.GetRawQueryResults()
		if err = conn.WriteJSON(queryResults); err != nil {
			log.Println("error sending query results over web socket: ", err)
		}
	}
}

func StartServer(port string, altRootDir string) {
	var dist fs.FS
	var err error
	if altRootDir == "" {
		log.Println("Using default dist directory for web UI.")
		dist, err = fs.Sub(web, "web/dist")
		if err != nil {
			log.Fatal("Error reading default dist folder", err)
			panic(err)
		}
	} else {
		log.Println("Using alternate dist directory for web UI.", altRootDir)
		dist = os.DirFS(altRootDir)
	}

	server = Server{
		clients: make(map[*websocket.Conn]bool),
		dist:    dist,
	}

	http.Handle("/", http.FileServer(http.FS(dist)))
	http.HandleFunc("/ws", server.webSocketHandler)
	http.HandleFunc("/raw-query-results", server.rawQueryResultsHandler)
	http.HandleFunc("/typed-query-results", server.typedQueryResultsHandler)

	log.Fatal(http.ListenAndServe(":"+port, nil))

}

func (server *Server) typedQueryResultsHandler(w http.ResponseWriter, r *http.Request) {
	// allow all origins
	w.Header().Set("Access-Control-Allow-Origin", "*")
	queryResults, err := parse.GetTypedQueryResults()
	if err != nil {
		log.Println("Error getting query results in typed format.", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error getting query results in typed format."))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(queryResults)
}

func (server *Server) rawQueryResultsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	queryResults := results.GetRawQueryResults()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(queryResults)
}

func (server *Server) webSocketHandler(w http.ResponseWriter, r *http.Request) {
	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer connection.Close()
	server.rwMutex.Lock()
	server.clients[connection] = true
	server.rwMutex.Unlock()

	cleanUp := func() {
		server.rwMutex.Lock()
		delete(server.clients, connection)
		server.rwMutex.Unlock()
	}
	defer cleanUp()

	for {
		mt, message, err := connection.ReadMessage()

		if err != nil || mt == websocket.CloseMessage {
			break
		}

		go handleWebSocketMessage(message, connection)
	}
}

func (server *Server) broadcast(message []byte) {
	for client := range server.clients {
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Fatal("failed to broadcast message to websocket connections ", err)
		}
	}
}

func BroadcastQueryResults() {
	queryResults := results.GetRawQueryResults()
	notification := results.NewQueryResultsNotification{ParsedAt: queryResults.ParsedAt}
	for conn := range server.clients {
		if err := conn.WriteJSON(notification); err != nil {
			log.Println("error broadcasting message: ", notification, err)
		}
	}
}
