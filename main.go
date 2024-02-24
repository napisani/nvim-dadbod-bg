package main

import (
	"log"
	"os"

	"github.com/neovim/go-client/nvim/plugin"
)

type FileAutocmdEval struct {
	Filename string `eval:"expand('<amatch>:h')"`
}

func main() {
	// create a log to log to right away. It will help with debugging
	l, _ := os.Create("/tmp/dadbod-ext.log")
	log.SetOutput(l)

	go StartServer()
	plugin.Main(func(p *plugin.Plugin) error {
		p.HandleAutocmd(&plugin.AutocmdOptions{Event: "User", Group: "ExmplNvGoClientGrp", Pattern: "*DBExecutePost", Eval: "*"},
			func(eval *FileAutocmdEval) {
				log.Print("DBEXEC wrote a buffer line: " + eval.Filename)
				SetQueryResults(eval.Filename)
				BroadcastQueryResults()
				log.Print("DBEXEC wrote a buffer line: " + GetQueryResults().Content)
			})
		return nil
	})

}
