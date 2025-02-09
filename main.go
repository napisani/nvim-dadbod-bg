// package main

// import (
// 	"fmt"
// 	"log"
// 	"os"

// 	"path"

// 	"github.com/neovim/go-client/nvim/plugin"
// )

// type FileAutocmdEval struct {
// 	Filename string `eval:"expand('<amatch>:h')"`
// }

// type FileManualCmdEval struct {
// 	Cwd  string `msgpack:",array"`
// 	File string
// }

// func initLog(debug bool) {
// 	tmpDir := os.TempDir()
// 	var logPath string
// 	if os.Getenv("NVIM_DBBG_LOG_FILE") != "" {
// 		logPath = os.Getenv("NVIM_DBBG_LOG_FILE")
// 	} else {
// 		logPath = path.Join(tmpDir, "nvim-dbbg.log")
// 	}
// 	if debug {
// 		fmt.Println("Logging to: " + logPath)
// 	}
// 	l, _ := os.Create(logPath)
// 	log.SetOutput(l)
// }

// func main() {
// 	// create a log to log to right away. It will help with debugging
// 	filename := os.Getenv("NVIM_DBBG_FILE")
// 	initLog(filename != "")
// 	if filename != "" {

// 		log.Print("Setting initial results file to: " + filename)
// 		if _, err := os.Stat(filename); err == nil {
// 			SetQueryResults(filename)
// 		} else {
// 			log.Print("File does not exist: " + filename)
// 		}
// 	}
// 	port := os.Getenv("NVIM_DBBG_PORT")
// 	if port == "" {
// 		port = "4546"
// 	}
// 	altRootDir := os.Getenv("NVIM_DBBG_UI_ROOT_DIR")

// 	go StartServer(port, altRootDir)
// 	plugin.Main(func(p *plugin.Plugin) error {

// 		p.HandleCommand(&plugin.CommandOptions{Name: "DBBGSetFile", NArgs: "?", Eval: "[getcwd(), expand('%:p')]"},
// 			func(args []string, eval *FileManualCmdEval) {
// 				if len(args) > 0 && len(args[0]) > 0 {
// 					file := args[0]
// 					if file[0] == '/' || file[0] == '~' {
// 						log.Print("DBBGSetFile - using provided absolute path: " + file)
// 						SetQueryResults(file)
// 						BroadcastQueryResults()
// 					} else {
// 						file = path.Join(eval.Cwd, file)
// 						log.Print("DBBGSetFile - using provided file and relative path: " + file)
// 						SetQueryResults(file)
// 						BroadcastQueryResults()
// 					}
// 				} else {
// 					log.Print("DBBGSetFile - no args provided, using current file: " + eval.File)
// 					SetQueryResults(eval.File)
// 					BroadcastQueryResults()
// 				}
// 			})

// 		p.HandleAutocmd(&plugin.AutocmdOptions{Event: "User", Group: "ExmplNvGoClientGrp", Pattern: "*DBExecutePost", Eval: "*"},
// 			func(eval *FileAutocmdEval) {
// 				log.Print("DBExecutePost - wrote file: " + eval.Filename)
// 				SetQueryResults(eval.Filename)
// 				BroadcastQueryResults()
// 			})
// 		return nil
// 	})

// }
package main

import (
	"bufio"
	"fmt"
	"log"
	"os"

	"github.com/napisani/nvim-dadbod-bg/dbout"
)

func main() {
	files := []string{
		"examples/mssql.dbout",
		"examples/postgres.dbout",
		"examples/sqlite.dbout",
		"examples/mysql.dbout",
	}

	for _, file := range files {
		fmt.Printf("Parsing file: %s\n", file)
		content, err := readFile(file)
		if err != nil {
			log.Fatalf("Error reading file %s: %v", file, err)
		}

		dbout.ParseDBOutSubQueryResults(content)
		// for _, result := range results {
		// fmt.Printf("SubQueryResult: %+v\n", result)
		// }
	}
}

func readFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	var content string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		content += scanner.Text() + "\n"
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return content, nil
}
