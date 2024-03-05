package main

import (
	"encoding/csv"
	"io"
	"log"
	"strings"
)


func ParseCsvSubQueryResults(content string) []SubQueryResults {
  return []SubQueryResults{ParseCsvSubQueryResult(content)}
}

func ParseCsvSubQueryResult(content string) SubQueryResults {
	reader := csv.NewReader(strings.NewReader(content))
	rows := make([]map[string]interface{}, 0)
	var headerAcc HeaderAccumulator
	var headers []string

	first := true
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println("an error occurred parsing a csv line", err)
		}
		if first {
			headerAcc = *NewHeaderAccumulator(true, record)
			headers = record
			first = false
			continue
		}

		if len(record) != len(headers) {
			log.Println("csv record has different number of columns than header")
			continue
		}
		row := make(map[string]interface{})
		for i, header := range headers {
			row[header] = record[i]
		}

		headerAcc.inspectRow(row)
    rows = append(rows, row)
	}
	return SubQueryResults{
		Header:  headerAcc.ToDataHeaders(),
		Content: rows,
		Prefix:  "",
    Type:    "csv",
	}
}
