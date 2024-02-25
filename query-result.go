package main

import (
	"io/ioutil"
	"log"
	"strings"
)

type QueryResults struct {
	Type    string `json:"type"`
	Content string `json:"content"`
}

var queryResults QueryResults

func SetQueryResults(file string) {
	var t string
	if strings.HasSuffix(file, ".json") {
		t = "json"
	} else if strings.HasSuffix(file, ".dbout") {
		t = "dbout"
	} else {
		t = "txt"
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
