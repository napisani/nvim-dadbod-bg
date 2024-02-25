package main

import (
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
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
		queryResults := GetQueryResults()
		if err = conn.WriteJSON(queryResults); err != nil {
			log.Println(err)
		}
	}
}

func StartServer(port string) {
	dist, err := fs.Sub(web, "web/dist")
	if err != nil {
		log.Fatal("Error reading dist folder", err)
		panic(err)
	}

	server = Server{
		clients: make(map[*websocket.Conn]bool),
		dist:    dist,
	}

	http.Handle("/", http.FileServer(http.FS(dist)))
	http.HandleFunc("/ws", server.webSocketHandler)

	log.Fatal(http.ListenAndServe(":"+port, nil))

}

func (server *Server) webSocketHandler(w http.ResponseWriter, r *http.Request) {
	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer connection.Close()
	server.clients[connection] = true
	defer delete(server.clients, connection)

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
	queryResults := GetQueryResults()
	for conn := range server.clients {
		if err := conn.WriteJSON(queryResults); err != nil {
			log.Println(err)
		}
	}
}
