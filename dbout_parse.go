package main

import (
	"log"
	"regexp"
	"strings"
)

type AttributeMap map[string]interface{}

const columnDelimiter = " | "

func _parseDBOutSections(content string) [][]string {
	newlineRegex := regexp.MustCompile(`[\||\+][\r|\n|\r\n]`)
	lines := newlineRegex.Split(content, -1)
	sections := make([][]string, 0)
	currentSection := make([]string, 0)
	dividerRowCounter := 0

	for idx, line := range lines {
		if (strings.Count(line, "+") + strings.Count(line, "-")) == len(strings.TrimSpace(line)) {
			dividerRowCounter++
			if dividerRowCounter == 3 {
				sections = append(sections, append([]string(nil), currentSection...))
				currentSection = currentSection[:0]
				dividerRowCounter = 0
			}
		} else if strings.Contains(line, "|") {
			currentSection = append(currentSection, line)
		} else {
			log.Println("ignoring line - (not in dbout format):", line, "at index:", idx)
		}
	}

	if len(currentSection) > 0 {
		sections = append(sections, currentSection)
	}
	return sections
}

func _trimTableBorders(line string) string {
	return strings.TrimPrefix(line, "|")
}

func ParseDBOutSubQueryResults(content string) []SubQueryResults {
	sections := _parseDBOutSections(content)
	result := make([]SubQueryResults, len(sections))
	for idx, section := range sections {
		table := make([][]string, len(section))
		section[0] = _trimTableBorders(section[0])
		headerCount := strings.Count(section[0], columnDelimiter)
		for rowIdx, line := range section {
			line = _trimTableBorders(line)
			count := strings.Count(line, columnDelimiter)

			if len(line) == 0 || count != headerCount {
				log.Println("skipping line - column count mismatch line:\n" + line)
				log.Println("header:\n" + section[0])
				continue
			}

			table[rowIdx] = strings.Split(line, columnDelimiter)
			for col := range table[rowIdx] {
				table[rowIdx][col] = strings.TrimSpace(table[rowIdx][col])
			}
		}

		header := table[0]
		rows := table[1:]

		headerAcc := NewHeaderAccumulator(true, header)
		rowsWithCols := []AttributeMap{}

		for _, row := range rows {
			rowWithColKeys := make(AttributeMap)
			if len(row) != len(header) {
				log.Println("skipping row - column count mismatch:", row)
				continue
			}
			for colIdx, columnName := range header {
				rowWithColKeys[columnName] = row[colIdx]
			}
			headerAcc.inspectRow(rowWithColKeys)
			rowsWithCols = append(rowsWithCols, rowWithColKeys)
		}

		result[idx] = SubQueryResults{
			Type:    "dbout",
			Content: rowsWithCols,
			Prefix:  "",
			Header:  headerAcc.ToDataHeaders(),
		}
	}

	return result
}
