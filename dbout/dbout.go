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
	mysqlPattern            = `^mysql:*`
	psqlPattern             = `^psql:*`
	sqlitePattern           = `^sqlite:*`
	postgresRowCountPattern = `^\((\d+) rows?\)`
)

// Declare a variable to hold the compiled regexps
var ignoredRegexes []*regexp.Regexp

// init function to compile the regexps when the package is initialized
func init() {
	patterns := []string{
		mysqlPattern,
		psqlPattern,
		sqlitePattern,
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
	if len(t.Rows) == 0 {
		return
	}
	t.Rows = t.Rows[:len(t.Rows)-1]
}

func (t *Table) ToString() string {
	delim := " | "
	str := fmt.Sprintf("Header: \n%v\n", strings.Join(t.Header, delim))
	str += "Rows: \n"
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

func isRangeOnLine(line string, cr ColumnRange) bool {
	l := len(line)
	if cr.start < 0 || cr.start >= l {
		return false
	}
	if cr.end < 0 {
		return false
	}
	if cr.end > l {
		return false
	}
	if cr.start >= cr.end {
		return false
	}
	return true
}

func (rr *RowRule) ParseLine(row string) []string {
	if len(row) == 0 {
		return []string{}
	}
	cols := []string{}
	for _, r := range rr.ranges {
		// log.Println("RowRule.ParseLine", r, row, len(row))

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

		if isRangeOnLine(row, ColumnRange{start, end}) {
			col := row[start:end]
			col = strings.TrimSpace(col)
			cols = append(cols, col)
		} else {
			cols = append(cols, "")
		}

	}
	return cols
}

func NewRowRuleFromDivider(line string, borders bool) RowRule {
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
	rr := RowRule{ranges, borders}
	// log.Println("NewRowRuleFromDivider", rr)
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
	isDivider := matching_char_count == len(line_trimmed) && matching_char_count > 0
	return isDivider
}

func ParseDBOutTables(content string) []Table {
	contentLines := splitContent(content)
	tables := []Table{}
	if len(contentLines) == 0 {
		return tables
	}

	borders := hasBorders(contentLines)
	contentLines = trimBorders(contentLines)

	if len(contentLines) == 0 {
		return tables
	}

	var currentRule *RowRule
	var currentTable *Table
	for idx, line := range contentLines {
		if isLineIgnored(line) {
			continue
		}
		if isHeaderLineDivider(line) {
			// log.Println("isHeaderLineDivider", line)
			newRule := NewRowRuleFromDivider(line, borders)
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
		if currentRule == nil || currentTable == nil || !currentTable.HasHeader() {
			continue
		}
		parsedLine := currentRule.ParseLine(line)
		if len(parsedLine) == 0 {
			continue
		}
		currentTable.AddRow(parsedLine)
	}

	if currentTable != nil {
		tables = append(tables, *currentTable)
	}

	return tables
}

func ParseDBOutSubQueryResults(content string) []results.SubQueryResults {
	tables := ParseDBOutTables(content)

	r := []results.SubQueryResults{}
	for _, table := range tables {
		if !table.HasHeader() {
			continue
		}
		r = append(r, table.ToSubQueryResults())
	}

	return r
}
