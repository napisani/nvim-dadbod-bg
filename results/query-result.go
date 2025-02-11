package results

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
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

func (sqr SubQueryResults) String() string {
	return fmt.Sprintf(
		"SubQueryResults{\n"+
			"    Prefix: %s,\n"+
			"    Type: %s,\n"+
			"    Content: %v,\n"+
			"    Header: %v\n"+
			"}",
		sqr.Prefix,
		sqr.Type,
		sqr.Content,
		sqr.Header,
	)
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
	t := filepath.Ext(file)
	if t == "" || t == "." {
		t = "txt"
	} else {
		t = t[1:]
	}

	log.Println("Reading file:" + file)
	content, err := ioutil.ReadFile(file)
	if err != nil {
		log.Fatal(err)
	} else {
		rawQueryResults = RawQueryResults{
			t,
			string(content),
			time.Now().Unix(),
		}
	}
}

func GetRawQueryResults() RawQueryResults {
	return rawQueryResults
}

// func GetTypedQueryResults() (TypedQueryResults, error) {
// 	content := rawQueryResults.Content
// 	log.Println("Type", rawQueryResults.Type)
// 	if rawQueryResults.Type == "json" {
// 		log.Println("Parsing json")
// 		subQueryResults := ParseJsonSubQueryResults(content)
// 		log.Println("Parsed json successfully")
// 		return TypedQueryResults{
// 			Type:     "json",
// 			Content:  subQueryResults,
// 			ParsedAt: rawQueryResults.ParsedAt}, nil
// 	} else if rawQueryResults.Type == "csv" {
// 		log.Println("Parsing csv")
// 		subQueryResults := ParseCsvSubQueryResults(content)
// 		log.Println("Parsed csv successfully")
// 		return TypedQueryResults{
// 			Type:     "csv",
// 			Content:  subQueryResults,
// 			ParsedAt: rawQueryResults.ParsedAt}, nil
// 	} else if rawQueryResults.Type == "dbout" {
// 		log.Println("Parsing dbout")
// 		subQueryResults := ParseDBOutSubQueryResults(content)
// 		log.Println("Parsed dbout successfully")
// 		return TypedQueryResults{
// 			Type:     "dbout",
// 			Content:  subQueryResults,
// 			ParsedAt: rawQueryResults.ParsedAt}, nil
// 	}

// 	return TypedQueryResults{}, errors.New("Unknown type")

// }
