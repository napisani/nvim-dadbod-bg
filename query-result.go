package main

import (
	"io/ioutil"
	"log"
	"strings"
)

type QueryResults struct {
	//json or csv
	Type    string `json:"type"`
	Content string `json:"content"`
}

var queryResults QueryResults

func SetQueryResults(file string) {
	var t string
	if strings.HasSuffix(file, ".json") {
		t = "json"
	} else {
		t = "csv"
	}
	content, err := ioutil.ReadFile(file)
	if err != nil {
		log.Fatal(err)
	}

	queryResults = QueryResults{t, string(content)}
}

func GetQueryResults() QueryResults {
	return queryResults
}

// init module function
func init() {
  log.Println("init query-result.go")
	SetQueryResults("/tmp/12.json")
}
