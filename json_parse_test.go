package main

import (
	"encoding/json"
	"io/ioutil"
	"reflect"
	"slices"
	"strings"
	"testing"
)

func TestMatchesPrefixes(t *testing.T) {
	tests := []struct {
		line     string
		ranges   []MatchRange
		prefixes []string
	}{
		{
			line:     "abc>def",
			ranges:   []MatchRange{{start: 0, end: 4}},
			prefixes: []string{"abc>"},
		},
		{
			line:     "abc>{def}",
			ranges:   []MatchRange{{start: 0, end: 4}},
			prefixes: []string{"abc>"},
		},
		{
			line:     "abc[>def]",
			ranges:   []MatchRange{},
			prefixes: []string{},
		},
		{
			line:     "abc{>def}",
			ranges:   []MatchRange{},
			prefixes: []string{},
		},
		{
			line:     "abc[def]>foo",
			ranges:   []MatchRange{{start: 0, end: 9}},
			prefixes: []string{"abc[def]>"},
		},
		{
			line:     "abc>{def[ghi]",
			ranges:   []MatchRange{{start: 0, end: 4}},
			prefixes: []string{"abc>"},
		},
		{
			line:     "abc>\n[def]>foo",
			ranges:   []MatchRange{{start: 0, end: 4}, {start: 5, end: 11}},
			prefixes: []string{"abc>", "[def]>"},
		},
		{
			line:     "\n\nab[c]>\n[def>foo]\nxyz>",
			ranges:   []MatchRange{{start: 2, end: 8}, {start: 19, end: 23}},
			prefixes: []string{"ab[c]>", "xyz>"},
		},
	}

	for _, test := range tests {
		ranges := matchesPrefixes(test.line)
		if len(ranges) != len(test.ranges) {
			t.Errorf("Expected %d ranges, but got %d", len(test.ranges), len(ranges))
		}

		for i, expectedRange := range test.ranges {
			if ranges[i].start != expectedRange.start || ranges[i].end != expectedRange.end {
				t.Errorf("Expected range %d to be %v, but got %v", i, expectedRange, ranges[i])
			}
			prefix := stringSegment(test.line, ranges[i])
			if !slices.Contains(test.prefixes, prefix) {
				t.Errorf("Expected prefix %s to be in %v", prefix, test.prefixes)
			}
		}
	}
}

func TestParsePrefixLinePairs(t *testing.T) {
	content := "prefix1>line1\nprefix2>line2\nprefix3>line3"

	expected := []PrefixLinePairs{
		PrefixLinePairs{
			prefix: "prefix1>",
			line:   "line1\n",
		},
		PrefixLinePairs{
			prefix: "prefix2>",
			line:   "line2\n",
		},
		PrefixLinePairs{
			prefix: "prefix3>",
			line:   "line3",
		},
	}

	result := parsePrefixLinePairs(content)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, but got %v", expected, result)
	}
}

func TestParseJsonSections(t *testing.T) {
	content, _ := ioutil.ReadFile("./test_data/mongo.json")
	contentStr := string(content)

	pairs := parsePrefixLinePairs(contentStr)
	expected := []PrefixLinePairs{
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] test>",
			line:   ``,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] test>",
			line:   " switched to db mongo_test\n",
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line:   ``,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line:   ``,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line:   ``,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line: `[
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb76"),
    name: 'Product 1',
    price: 10
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb77"),
    name: 'Product 2',
    price: 20
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb78"),
    name: 'Product 3',
    price: 30
  }
]`,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line: `[
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb74"),
    name: 'John Doe',
    age: 25,
    email: 'johndoe@example.com'
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb75"),
    name: 'Jane Smith',
    age: 30,
    email: 'janesmith@example.com'
  }
]`,
		},
		PrefixLinePairs{
			prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			line:   ``,
		},
	}

	if len(pairs) != len(expected) {
		t.Errorf("Expected %d pairs, but got %d", len(expected), len(pairs))
	}

	for i, pair := range pairs {
		if strings.TrimSpace(pair.prefix) != strings.TrimSpace(expected[i].prefix) {
			t.Errorf("Expected %s, but got %s", expected[i].prefix, pair.prefix)
		}
		if strings.TrimSpace(pair.line) != strings.TrimSpace(expected[i].line) {
			t.Errorf("Expected %s, but got %s", expected[i].line, pair.line)
		}
	}
}

func TestParseJsonSubQueryResults(t *testing.T) {
	content, _ := ioutil.ReadFile("./test_data/mongo.json")
	contentStr := string(content)
	expected := []SubQueryResults{
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] test>",
			Type:    "text",
			Content: "",
		},
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] test>",
			Type:    "text",
			Content: " switched to db mongo_test\n",
		},
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:    "text",
			Content: "",
		},
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:    "text",
			Content: "",
		},
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:    "text",
			Content: "",
		},
		SubQueryResults{
			Prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:   "text",
			Content: `[
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb76"),
    name: 'Product 1',
    price: 10
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb77"),
    name: 'Product 2',
    price: 20
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb78"),
    name: 'Product 3',
    price: 30
  }
]`,
			Header: []DataHeader{},
		},
		SubQueryResults{
			Prefix: "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:   "text",
			Content: `[
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb74"),
    name: 'John Doe',
    age: 25,
    email: 'johndoe@example.com'
  },
  {
    _id: ObjectId("65dfdd30dc55cc0daa1cfb75"),
    name: 'Jane Smith',
    age: 30,
    email: 'janesmith@example.com'
  }
]`,
			Header: []DataHeader{},
		},
		SubQueryResults{
			Prefix:  "Enterprise rs-localdev [direct: primary] mongo_test>",
			Type:    "text",
			Content: "",
		},
	}

	results := ParseJsonSubQueryResults(contentStr)

	if len(results) != len(expected) {
		t.Errorf("Expected %d results, but got %d", len(expected), len(results))
	}

	for i, res := range results {
		if strings.TrimSpace(res.Prefix) != strings.TrimSpace(expected[i].Prefix) {
			t.Errorf("Expected prefix %s, but got %s", expected[i].Prefix, res.Prefix)
		}
		if res.Type != expected[i].Type {
			t.Errorf("Expected type %s, but got %s", expected[i].Type, res.Type)
		}
		_, err := json.Marshal(res.Content)
		if err != nil {
			t.Errorf("Error marshalling content: %v", err)
		}
		// if strings.TrimSpace(string(jsonString)) != strings.TrimSpace(expected[i].Content.(string)) {
		// 	t.Errorf("Expected content %s, but got %s", expected[i].Content, res.Content)
		// }
		if len(res.Header) != len(expected[i].Header) {
			t.Errorf("Expected %d headers, but got %d", len(expected[i].Header), len(res.Header))
		}
	}
}
