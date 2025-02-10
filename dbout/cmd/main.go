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
		"./test_data/mssql_manual.dbout",
		"./test_data/postgres_manual.dbout",
		"./test_data/sqlite_manual.dbout",
		"./test_data/mysql_manual.dbout",
	}

	for _, file := range files {
		fmt.Printf("Parsing file: %s\n", file)
		content, err := readFile(file)
		if err != nil {
			log.Fatalf("Error reading file %s: %v", file, err)
		}

		results := dbout.ParseDBOutTables(content)
		for _, result := range results {
			fmt.Printf("%v\n", result.ToString())
		}
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
