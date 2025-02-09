package parse

import (
	"errors"
	"log"

	"github.com/napisani/nvim-dadbod-bg/csv"
	"github.com/napisani/nvim-dadbod-bg/dbout"
	"github.com/napisani/nvim-dadbod-bg/json"
	"github.com/napisani/nvim-dadbod-bg/results"
)

func GetTypedQueryResults() (results.TypedQueryResults, error) {
	rawQueryResults := results.GetRawQueryResults()
	content := rawQueryResults.Content
	log.Println("Type", rawQueryResults.Type)
	if rawQueryResults.Type == "json" {
		log.Println("Parsing json")
		subQueryResults := json.ParseJsonSubQueryResults(content)
		log.Println("Parsed json successfully")
		return results.TypedQueryResults{
			Type:     "json",
			Content:  subQueryResults,
			ParsedAt: rawQueryResults.ParsedAt}, nil
	} else if rawQueryResults.Type == "csv" {
		log.Println("Parsing csv")
		subQueryResults := csv.ParseCsvSubQueryResults(content)
		log.Println("Parsed csv successfully")
		return results.TypedQueryResults{
			Type:     "csv",
			Content:  subQueryResults,
			ParsedAt: rawQueryResults.ParsedAt}, nil
	} else if rawQueryResults.Type == "dbout" {
		log.Println("Parsing dbout")
		subQueryResults := dbout.ParseDBOutSubQueryResults(content)
		log.Println("Parsed dbout successfully")
		return results.TypedQueryResults{
			Type:     "dbout",
			Content:  subQueryResults,
			ParsedAt: rawQueryResults.ParsedAt}, nil
	}

	return results.TypedQueryResults{}, errors.New("Unknown type")

}
