package csv

import (
	"reflect"
	"testing"

	"github.com/napisani/nvim-dadbod-bg/results"
)

func TestParseCsvSubQueryResult(t *testing.T) {
	content := "name,age,email\nJohn,25,john@example.com\nJane,30,jane@example.com"
	expectedHeader := []results.DataHeader{
		results.DataHeader{Name: "name", InferredType: "string"},
		results.DataHeader{Name: "age", InferredType: "number"},
		results.DataHeader{Name: "email", InferredType: "string"},
	}
	expectedContent := []map[string]interface{}{
		{"name": "John", "age": "25", "email": "john@example.com"},
		{"name": "Jane", "age": "30", "email": "jane@example.com"},
	}

	result := ParseCsvSubQueryResult(content)

	for i, header := range result.Header {
		if header.Name != expectedHeader[i].Name {
			t.Errorf("ParseCsvSubQueryResult() failed, expected header name: %s, got: %s", expectedHeader[i].Name, header.Name)
		}
		if header.InferredType != expectedHeader[i].InferredType {
			t.Errorf("ParseCsvSubQueryResult() failed, expected header inferred type: %s, got: %s", expectedHeader[i].InferredType, header.InferredType)
		}
	}

	if !reflect.DeepEqual(result.Content, expectedContent) {
		t.Errorf("ParseCsvSubQueryResult() failed, expected content: %v, got: %v", expectedContent, result.Content)
	}

	if result.Prefix != "" {
		t.Errorf("ParseCsvSubQueryResult() failed, expected prefix to be empty, got: %s", result.Prefix)
	}

	if result.Type != "csv" {
		t.Errorf("ParseCsvSubQueryResult() failed, expected type to be 'csv', got: %s", result.Type)
	}
}
