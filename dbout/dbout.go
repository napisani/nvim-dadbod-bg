package dbout

import (
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/napisani/nvim-dadbod-bg/results"
)

type AttributeMap map[string]interface{}

// Define constant string patterns
const (
	mysqlWarningPattern     = `^mysql: \[.*`
	postgresRowCountPattern = `^\((\d+) rows?\)`
)

// Declare a variable to hold the compiled regexps
var ignoredRegexes []*regexp.Regexp

// init function to compile the regexps when the package is initialized
func init() {
	patterns := []string{
		mysqlWarningPattern,
		postgresRowCountPattern,
	}

	ignoredRegexes = make([]*regexp.Regexp, len(patterns))
	for i, pattern := range patterns {
		ignoredRegexes[i] = regexp.MustCompile(pattern)
	}
}

type Table struct {
	Header []string
	Rows   [][]string
}

func NewTable() *Table {
	return &Table{
		Header: []string{},
		Rows:   [][]string{},
	}
}

func (t *Table) IsEmpty() bool {
	return len(t.Rows) == 0
}

func (t *Table) HasHeader() bool {
	return len(t.Header) > 0
}

func (t *Table) AddRow(row []string) {
	t.Rows = append(t.Rows, row)
}

func (t *Table) SetHeader(header []string) {
	t.Header = header
}

func (t *Table) RemoveLastRow() {
	t.Rows = t.Rows[:len(t.Rows)-1]
}

func (t *Table) ToString() string {
	delim := " | "
	str := fmt.Sprintf("Header: \n%v\n", strings.Join(t.Header, delim))
	for _, row := range t.Rows {
		str += strings.Join(row, delim) + "\n"
	}
	return str
}

func (t *Table) ToSubQueryResults() results.SubQueryResults {
	header := t.Header
	rows := t.Rows

	headerAcc := results.NewHeaderAccumulator(true, header)
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
		headerAcc.InspectRow(rowWithColKeys)
		rowsWithCols = append(rowsWithCols, rowWithColKeys)
	}

	return results.SubQueryResults{
		Type:    "dbout",
		Content: rowsWithCols,
		Prefix:  "",
		Header:  headerAcc.ToDataHeaders(),
	}
}

type ColumnRange struct {
	start int
	end   int
}

type RowRule struct {
	ranges    []ColumnRange
	hasBorder bool
}

func (rr *RowRule) ParseLine(row string) []string {
	cols := []string{}
	for _, r := range rr.ranges {
		end := r.end
		start := r.start
		if end == -1 && start > -1 {
			// final range case - take the rest of the line
			end = len(row)
			if rr.hasBorder {
				// if it has a border then trim off the border character
				end--
			}
		}

		if end <= len(row) && start > -1 {
			col := row[start:end]
			col = strings.TrimSpace(col)
			cols = append(cols, col)
		} else {
			cols = append(cols, "")
		}

	}
	return cols
}

func NewRowRuleFromDivider(line string) RowRule {
	ranges := []ColumnRange{}
	start := 0
	end := 0
	content_reg := regexp.MustCompile(`[-]+`)
	matches := content_reg.FindAllStringIndex(line, -1)
	for idx, match := range matches {
		start = match[0]
		if idx != len(matches)-1 {
			end = match[1]
			if end-start > 0 {
				ranges = append(ranges, ColumnRange{start, end})
			}
		} else {
			// the last column range should go to the end of the output
			ranges = append(ranges, ColumnRange{start, -1})
		}
	}
	rr := RowRule{ranges, isHeaderLineDivider(line)}
	return rr
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
		includedLineIdx++
	}
	return false
}

const (
	NONE int = iota
	BEGIN
	HEADER
	END
)

type BorderTracker struct {
	position int
}

func NewBorderTracker() *BorderTracker {
	return &BorderTracker{
		position: NONE,
	}
}

func (bt *BorderTracker) divide() {
	if bt.position == NONE {
		bt.position = BEGIN
	} else if bt.position == BEGIN {
		bt.position = HEADER
	} else if bt.position == HEADER {
		bt.position = END
	} else if bt.position == END {
		bt.position = BEGIN
	}
}

func (bt *BorderTracker) shouldRemoveDivider() bool {
	return bt.position == BEGIN || bt.position == END
}

func trimBorders(lines []string) []string {
	b := hasBorders(lines)

	if !b {
		return lines
	}
	trimmed_lines := []string{}
	border_tracker := NewBorderTracker()

	for _, line := range lines {
		if isLineIgnored(line) {
			continue
		}

		if isHeaderLineDivider(line) {
			border_tracker.divide()
			if !border_tracker.shouldRemoveDivider() {
				trimmed_lines = append(trimmed_lines, line)
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
	isDivider := matching_char_count == len(line_trimmed)
	return isDivider
}

func ParseDBOutSubQueryResults(content string) []results.SubQueryResults {
	var result []results.SubQueryResults
	contentLines := splitContent(content)

	if len(contentLines) == 0 {
		return result
	}

	contentLines = trimBorders(contentLines)

	for _, line := range contentLines {
		fmt.Println(line)
	}
	fmt.Println("----")
	if len(contentLines) == 0 {
		return result
	}

	tables := []Table{}
	var currentRule *RowRule
	var currentTable *Table
	for idx, line := range contentLines {
		if isLineIgnored(line) {
			continue
		}
		if isHeaderLineDivider(line) {
			newRule := NewRowRuleFromDivider(line)
			currentRule = &newRule
			lastLine := contentLines[idx-1]
			if currentTable != nil {
				currentTable.RemoveLastRow()
			}
			if currentTable != nil {
				tables = append(tables, *currentTable)
			}
			currentTable = NewTable()
			header := currentRule.ParseLine(lastLine)
			currentTable.SetHeader(header)
			continue
		}
		if currentRule == nil {
			continue
		}
		currentTable.AddRow(currentRule.ParseLine(line))
	}

	if currentTable != nil {
		tables = append(tables, *currentTable)
	}

	r := []results.SubQueryResults{}
	for _, table := range tables {
		if table.IsEmpty() && !table.HasHeader() {
			continue
		}
		fmt.Println(table.ToString())
		r = append(r, table.ToSubQueryResults())
	}

	return r
}
