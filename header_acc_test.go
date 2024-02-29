package main

import (
	"testing"
)

func TestInspectRow(t *testing.T) {
	h := NewHeaderAccumulator(true, nil)

	row := map[string]interface{}{
		"header1": true,
		"header2": 42.5,
		"header3": "2022-01-01T00:00:00Z",
		"header4": `{"key": "value"}`,
		"header5": "hello world",
	}

	h.inspectRow(row)

	expectedHeaders := map[string]string{
		"header1": "boolean",
		"header2": "number",
		"header3": "date",
		"header4": "object",
		"header5": "string",
	}

	headers := h.ToDataHeaders()

	if len(headers) != len(expectedHeaders) {
		t.Errorf("Expected %d headers, but got %d", len(expectedHeaders), len(headers))
	}

	for _, header := range headers {
		inferredType := expectedHeaders[header.Name]
		if header.InferredType != inferredType {
			t.Errorf("Expected header type to be %s, but got %s", inferredType, header.InferredType)
		}
	}
}

func TestReevaluateInferredType(t *testing.T) {
	h := NewHeaderAccumulator(true, nil)

	header := DataHeader{
		Name:         "header1",
		InferredType: "",
	}

	valueNumber := 42.5
	newType := h.reevaluateInferredType(valueNumber, header)
	expectedType := "number"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	dateVal := "2022-01-01T00:00:00Z"
	newType = h.reevaluateInferredType(dateVal, header)
	expectedType = "date"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	jsonValue := `{"key": "value"}`
	newType = h.reevaluateInferredType(jsonValue, header)
	expectedType = "object"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	valueString := "hello world"
	newType = h.reevaluateInferredType(valueString, header)
	expectedType = "string"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}
}

func TestReevaluateInferredTypeWithConflictingExistingType(t *testing.T) {
	h := NewHeaderAccumulator(true, nil)

	header := DataHeader{
		Name:         "header1",
		InferredType: "boolean",
	}

	valueNumber := 42.5
	newType := h.reevaluateInferredType(valueNumber, header)
	expectedType := "string"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	dateVal := "2022-01-01T00:00:00Z"
	newType = h.reevaluateInferredType(dateVal, header)
	expectedType = "string"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	jsonValue := `{"key": "value"}`
	newType = h.reevaluateInferredType(jsonValue, header)
	expectedType = "string"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}

	valueString := "hello world"
	newType = h.reevaluateInferredType(valueString, header)
	expectedType = "string"
	if newType != expectedType {
		t.Errorf("Expected type to be %s, but got %s", expectedType, newType)
	}
}

func TestAddHeader(t *testing.T) {
	h := NewHeaderAccumulator(true, nil)

	h.addHeader("header1")
	h.addHeader("header2")
	h.addHeader("header3")

	expectedHeaders := []string{"header1", "header2", "header3"}

	headers := h.ToDataHeaders()
	if len(headers) != len(expectedHeaders) {
		t.Errorf("Expected %d headers, but got %d", len(expectedHeaders), len(headers))
	}

	for i, header := range headers {
		if header.Name != expectedHeaders[i] {
			t.Errorf("Expected header name to be %s, but got %s", expectedHeaders[i], header.Name)
		}
	}
}
