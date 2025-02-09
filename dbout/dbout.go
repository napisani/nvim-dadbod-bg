package dbout

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/napisani/nvim-dadbod-bg/results"
)

type AttributeMap map[string]interface{}
type CharRange struct {
	start int
	end   int
}

const columnDelimiter = " | "

// Define constant string patterns
const (
	mysqlWarningPattern     = `^mysql: \[.*`
	postgresRowCountPattern = `^\((\d+) rows?\)`
)

// Declare a variable to hold the compiled regexps
var ignoredRegexes []*regexp.Regexp

// init function to compile the regexps when the package is initialized
func init() {
	println("init")
	patterns := []string{
		mysqlWarningPattern,
		postgresRowCountPattern,
	}

	ignoredRegexes = make([]*regexp.Regexp, len(patterns))
	for i, pattern := range patterns {
		ignoredRegexes[i] = regexp.MustCompile(pattern)
	}
}

func splitContent(content string) []string {
	newlineRegex := regexp.MustCompile(`\r?\n`)
	return newlineRegex.Split(content, -1)
}

func isLineIgnored(line string) bool {
	lineTrimmed := strings.TrimSpace(line)
	for _, ignoredReg := range ignoredRegexes {
		if ignoredReg.MatchString(lineTrimmed) {
			// log.Println("ignoring line:", line)
			return true
		}
	}
	return false
}

func hasBorders(lines []string) bool {
	includedLineIdx := 0
	for _, line := range lines {
		if isLineIgnored(line) {
			continue
		}

		if isHeaderLineDivider(line) {
			// if the first real content line is a divider, then there are borders
			return includedLineIdx == 0
		}
	}
	return false
}

type BorderTracker struct {
	foundBegin  bool
	foundHeader bool
	foundEnd    bool
}

func (bt *BorderTracker) reset() {
	bt.foundBegin = false
	bt.foundHeader = false
	bt.foundEnd = false
}

func (bt *BorderTracker) divide() {
	if bt.foundBegin && bt.foundHeader && bt.foundEnd {
		bt.reset()
		bt.foundBegin = true
	} else if !bt.foundBegin {
		bt.foundBegin = true
	} else if bt.foundBegin && !bt.foundHeader {
		bt.foundBegin = true
	} else if bt.foundBegin && bt.foundHeader && !bt.foundEnd {
		bt.foundEnd = true
	}
}
func (bt *BorderTracker) shouldRemoveDivider() bool {
	if bt.foundBegin && !bt.foundHeader && !bt.foundEnd {
		return true
	}
	if bt.foundEnd {
		return true
	}
	return false
}

func trimBorders(lines []string) []string {
	if !hasBorders(lines) {
		return lines
	}
	trimmed_lines := []string{}
	border_tracker := BorderTracker{}

	for idx, line := range lines {
		if isLineIgnored(line) {
			continue
		}

		if isHeaderLineDivider(line) {
			border_tracker.divide()
			if !border_tracker.shouldRemoveDivider() {
				trimmed_lines = append(trimmed_lines, line)
			} else {
				fmt.Println("removing divider " + string(idx))
			}
		} else {
			trimmed_lines = append(trimmed_lines, line)
		}

	}

	return trimmed_lines

}

func isHeaderLineDivider(line string) bool {
	line_trimmed := strings.TrimSpace(line)
	// regex to match - or + or space or |
	allowedChars := regexp.MustCompile(`[-+|\s]`)
	matching_char_count := len(allowedChars.FindAllString(line_trimmed, -1))
	return matching_char_count == len(line_trimmed)
}

func ParseDBOutSubQueryResults(content string) []results.SubQueryResults {
	var result []results.SubQueryResults
	content_lines := splitContent(content)

	if len(content_lines) == 0 {
		return result
	}

	content_lines = trimBorders(content_lines)

	if len(content_lines) == 0 {
		return result
	}

	included_line_idx := 0
	for _, line := range content_lines {
		if isLineIgnored(line) {
			continue
		}
		fmt.Println(line)

		included_line_idx++
	}

	return result
}

// func getSubQueryResults(header string, rows []string) results.SubQueryResults {
// headerAcc := results.NewHeaderAccumulator(true, header)
// rowsWithCols := []AttributeMap{}

// for _, row := range rows {
// 	rowWithColKeys := make(AttributeMap)
// 	if len(row) != len(header) {
// 		log.Println("skipping row - column count mismatch:", row)
// 		continue
// 	}
// 	for colIdx, columnName := range header {
// 		rowWithColKeys[columnName] = row[colIdx]
// 	}
// 	headerAcc.inspectRow(rowWithColKeys)
// 	rowsWithCols = append(rowsWithCols, rowWithColKeys)
// }

// result[idx] = SubQueryResults{
// 	Type:    "dbout",
// 	Content: rowsWithCols,
// 	Prefix:  "",
// 	Header:  headerAcc.ToDataHeaders(),
// }
// }
