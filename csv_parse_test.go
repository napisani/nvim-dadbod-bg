package main

import (
	"reflect"
	"testing"
)

func TestParseCsvSubQueryResult(t *testing.T) {
	content := "name,age,email\nJohn,25,john@example.com\nJane,30,jane@example.com"
	expectedHeader := []DataHeader{
		DataHeader{Name: "name", InferredType: "string"},
		DataHeader{Name: "age", InferredType: "number"},
		DataHeader{Name: "email", InferredType: "string"},
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
