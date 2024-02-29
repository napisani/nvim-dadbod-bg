package main

import (
	"errors"
	"io/ioutil"
	"log"
	"strings"
)

type RawQueryResults struct {
	Type    string `json:"type"`
	Content string `json:"content"`
}

type SubQueryResults struct {
	Prefix  string      `json:"prefix"`
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
	Header  DataHeaders `json:"header"`
}

type TypedQueryResults struct {
	Type    string            `json:"type"`
	Content []SubQueryResults `json:"content"`
}

type DataHeader struct {
	Name         string `json:"name"`
	InferredType string `json:"inferredType"`
}

type DataHeaders []DataHeader

var rawQueryResults RawQueryResults

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

	rawQueryResults = RawQueryResults{t, string(content)}
}

func GetRawQueryResults() RawQueryResults {
	return rawQueryResults
}

func GetTypedQueryResults() (TypedQueryResults, error) {
	content := rawQueryResults.Content
	log.Println("Type", rawQueryResults.Type)
	if rawQueryResults.Type == "json" {
		log.Println("Parsing json")
		subQueryResults := ParseJsonSubQueryResults(content)
		log.Println("Parsed json successfully")
		return TypedQueryResults{Type: "json", Content: subQueryResults}, nil
	} else if rawQueryResults.Type == "dbout" {
		return TypedQueryResults{Type: "dbout", Content: ParseDBOutSubQueryResults(content)}, nil
	}
	return TypedQueryResults{}, errors.New("Unknown type")

}
