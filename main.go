package main

import (
	"fmt"
	"log"
	"os"
	"path"

	"github.com/napisani/nvim-dadbod-bg/results"
	"github.com/neovim/go-client/nvim/plugin"
)

type FileAutocmdEval struct {
	Filename string `eval:"expand('<amatch>:h')"`
}

type FileManualCmdEval struct {
	Cwd  string `msgpack:",array"`
	File string
}

func initLog(debug bool) {
	tmpDir := os.TempDir()
	var logPath string
	if os.Getenv("NVIM_DBBG_LOG_FILE") != "" {
		logPath = os.Getenv("NVIM_DBBG_LOG_FILE")
	} else {
		logPath = path.Join(tmpDir, "nvim-dbbg.log")
	}
	if debug {
		fmt.Println("Logging to: " + logPath)
	}
	l, _ := os.Create(logPath)
	log.SetOutput(l)
}

func main() {
	// create a log to log to right away. It will help with debugging
	filename := os.Getenv("NVIM_DBBG_FILE")
	initLog(filename != "")
	if filename != "" {

		log.Print("Setting initial results file to: " + filename)
		if _, err := os.Stat(filename); err == nil {
			results.SetQueryResults(filename)
		} else {
			log.Print("File does not exist: " + filename)
		}
	}
	port := os.Getenv("NVIM_DBBG_PORT")
	if port == "" {
		port = "4546"
	}
	altRootDir := os.Getenv("NVIM_DBBG_UI_ROOT_DIR")

	go StartServer(port, altRootDir)
	plugin.Main(func(p *plugin.Plugin) error {

		p.HandleCommand(&plugin.CommandOptions{Name: "DBBGSetFile", NArgs: "?", Eval: "[getcwd(), expand('%:p')]"},
			func(args []string, eval *FileManualCmdEval) {
				if len(args) > 0 && len(args[0]) > 0 {
					file := args[0]
					if file[0] == '/' || file[0] == '~' {
						log.Print("DBBGSetFile - using provided absolute path: " + file)
						results.SetQueryResults(file)
						BroadcastQueryResults()
					} else {
						file = path.Join(eval.Cwd, file)
						log.Print("DBBGSetFile - using provided file and relative path: " + file)
						results.SetQueryResults(file)
						BroadcastQueryResults()
					}
				} else {
					log.Print("DBBGSetFile - no args provided, using current file: " + eval.File)
					results.SetQueryResults(eval.File)
					BroadcastQueryResults()
				}
			})

		p.HandleAutocmd(&plugin.AutocmdOptions{Event: "User", Group: "ExmplNvGoClientGrp", Pattern: "*DBExecutePost", Eval: "*"},
			func(eval *FileAutocmdEval) {
				log.Print("DBExecutePost - wrote file: " + eval.Filename)
				results.SetQueryResults(eval.Filename)
				BroadcastQueryResults()
			})
		return nil
	})
}
