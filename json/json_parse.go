package json

import (
	"encoding/json"

	"github.com/napisani/nvim-dadbod-bg/results"
)

type PrefixLinePairs struct {
	prefix string
	line   string
}

func (p PrefixLinePairs) String() string {
	return "\nPrefix: " + p.prefix + " \nLine: " + p.line
}

type MatchRange struct {
	start int
	end   int
}

func stringSegment(line string, matchRange MatchRange) string {
	return line[matchRange.start:matchRange.end]
}

func matchesPrefixes(line string) []MatchRange {
	ranges := []MatchRange{}
	lastNewLineIndex := -1
	sawBrace := false
	sawBracket := false
	reset := func() {
		lastNewLineIndex = -1
		sawBrace = false
		sawBracket = false
	}

	for idx, char := range line {
		if idx == 0 {
			reset()
			lastNewLineIndex = 0
		} else if char == '\n' && idx+1 < len(line) {
			reset()
			lastNewLineIndex = idx + 1
		}
		if char == '{' {
			sawBrace = true
		}
		if sawBrace && char == '}' {
			sawBrace = false
		}
		if char == '[' {
			sawBracket = true
		}
		if sawBracket && char == ']' {
			sawBracket = false
		}
		if char == '>' {
			if !sawBrace && !sawBracket && lastNewLineIndex != -1 {
				ranges = append(ranges, MatchRange{start: lastNewLineIndex, end: idx + 1})
			}
			reset()
		}
	}
	return ranges
}

func parsePrefixLinePairs(content string) []PrefixLinePairs {
	pairs := []PrefixLinePairs{}
	prefixMatchRanges := matchesPrefixes(content)
	for idx := 0; idx < len(prefixMatchRanges)-1; idx++ {
		current := prefixMatchRanges[idx]
		next := prefixMatchRanges[idx+1]
		prefix := stringSegment(content, current)
		mainContentRange := MatchRange{start: current.end, end: next.start}
		mainContent := stringSegment(content, mainContentRange)
		pair := PrefixLinePairs{prefix: prefix, line: mainContent}
		pairs = append(pairs, pair)
		if idx == len(prefixMatchRanges)-2 {
			prefix := stringSegment(content, next)
			mainContentRange = MatchRange{start: next.end, end: len(content)}
			mainContent = stringSegment(content, mainContentRange)
			pair = PrefixLinePairs{prefix: prefix, line: mainContent}
			pairs = append(pairs, pair)
		}
	}
	if len(prefixMatchRanges) == 0 {
		pairs = append(pairs, PrefixLinePairs{prefix: "", line: content})
	}
	return pairs
}

func ParseJsonSubQueryResults(content string) []results.SubQueryResults {
	pairs := parsePrefixLinePairs(content)
	results := []results.SubQueryResults{}
	for _, pair := range pairs {
		content := interface{}(nil)
		err := json.Unmarshal([]byte(pair.line), &content)
		if err == nil {
			headerAcc := results.NewHeaderAccumulator(true, nil)
			if arr, ok := content.([]interface{}); ok {
				for _, row := range arr {
					headerAcc.inspectRow(row.(map[string]interface{}))
				}
			} else {
				headerAcc.inspectRow(content.(map[string]interface{}))
			}
			results = append(results, results.SubQueryResults{
				Prefix:  pair.prefix,
				Type:    "json",
				Content: content,
				Header:  headerAcc.ToDataHeaders(),
			})
		} else {
			results = append(results, results.SubQueryResults{
				Prefix:  pair.prefix,
				Type:    "text",
				Content: pair.line,
			})
		}
	}
	return results
}
