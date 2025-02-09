package dbout

import (
	"reflect"
	"testing"

	"github.com/napisani/nvim-dadbod-bg/results"
)

func TestParseDBOutSections(t *testing.T) {
	content := `+----+-------+
| ID | Name  |
+----+-------+
| 1  | John  |
| 2  | Alice |
+----+-------+
+----+-------+
| ID | Name  |
+----+-------+
| 3  | Bob   |
+----+-------+`

	expected := []results.SubQueryResults{
		{
			Type:    "dbout",
			Content: []AttributeMap{{"ID": "1", "Name": "John"}, {"ID": "2", "Name": "Alice"}},
			Prefix:  "",
			Header: []results.DataHeader{
				results.DataHeader{Name: "ID", InferredType: "number"},
				results.DataHeader{Name: "Name", InferredType: "string"},
			},
		},
		{
			Type:    "dbout",
			Content: []AttributeMap{{"ID": "3", "Name": "Bob"}},
			Prefix:  "",
			Header: []results.DataHeader{
				results.DataHeader{Name: "ID", InferredType: "number"},
				results.DataHeader{Name: "Name", InferredType: "string"},
			},
		},
	}

	result := ParseDBOutSubQueryResults(content)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Unexpected result. Got: %+v, Expected: %+v", result, expected)
	}
}

func TestParseDBOutSubQueryResults_NoSections(t *testing.T) {
	content := `No sections found.`

	expected := []results.SubQueryResults{}

	result := ParseDBOutSubQueryResults(content)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Unexpected result. Got: %+v, Expected: %+v", result, expected)
	}
}
