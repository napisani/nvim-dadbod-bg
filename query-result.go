package main

import (
	"errors"
	"io/ioutil"
	"log"
	"strings"
	"time"
)

type NewQueryResultsNotification struct {
	ParsedAt int64 `json:"parsedAt"`
}

type RawQueryResults struct {
	Type     string `json:"type"`
	Content  string `json:"content"`
	ParsedAt int64  `json:"parsedAt"`
}

type SubQueryResults struct {
	Prefix  string      `json:"prefix"`
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
	Header  DataHeaders `json:"header"`
}

type TypedQueryResults struct {
	Type     string            `json:"type"`
	Content  []SubQueryResults `json:"content"`
	ParsedAt int64             `json:"parsedAt"`
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

	rawQueryResults = RawQueryResults{
		t,
		string(content),
		time.Now().Unix(),
	}
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
		return TypedQueryResults{Type: "json", Content: subQueryResults, ParsedAt: rawQueryResults.ParsedAt}, nil
	} else if rawQueryResults.Type == "dbout" {
		log.Println("Parsing dbout")
		subQueryResults := ParseDBOutSubQueryResults(content)
		log.Println("Parsed dbout successfully")
		return TypedQueryResults{Type: "dbout", 
      Content: subQueryResults, ParsedAt: rawQueryResults.ParsedAt}, nil
	}

	return TypedQueryResults{}, errors.New("Unknown type")

}
