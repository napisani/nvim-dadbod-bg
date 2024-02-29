package main

import (
	"reflect"
	"testing"
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

	expected := []SubQueryResults{
		{
			Type:    "dbout",
			Content: []AttributeMap{{"ID": "1", "Name": "John"}, {"ID": "2", "Name": "Alice"}},
			Prefix:  "",
			Header: []DataHeader{
				DataHeader{Name: "ID", InferredType: "number"},
				DataHeader{Name: "Name", InferredType: "string"},
			},
		},
		{
			Type:    "dbout",
			Content: []AttributeMap{{"ID": "3", "Name": "Bob"}},
			Prefix:  "",
			Header: []DataHeader{
				DataHeader{Name: "ID", InferredType: "number"},
				DataHeader{Name: "Name", InferredType: "string"},
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

	expected := []SubQueryResults{}

	result := ParseDBOutSubQueryResults(content)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Unexpected result. Got: %+v, Expected: %+v", result, expected)
	}
}

func TestParseDBOutSubQueryResults_IgnoredLines(t *testing.T) {
	content := `+----+-------+
| ID | Name  |
+----+-------+
| 1  | John  |
| Test line |
| 2  | Alice |
+----+-------+`

	expected := []SubQueryResults{
		{
			Type: "dbout",
			Content: []AttributeMap{
				AttributeMap{"ID": "1", "Name": "John"},
				AttributeMap{"ID": "2", "Name": "Alice"},
			},
			Prefix: "",
			Header: []DataHeader{
				DataHeader{Name: "ID", InferredType: "number"},
				DataHeader{Name: "Name", InferredType: "string"},
			},
		},
	}

	result := ParseDBOutSubQueryResults(content)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Unexpected result. Got: %+v, Expected: %+v", result, expected)
	}
}
