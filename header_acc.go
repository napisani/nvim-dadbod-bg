package main

import (
	"encoding/json"
	"errors"
	"strconv"
	"time"
)

type HeaderAccumulator struct {
	headers     map[string]DataHeader
	inferTypes  bool
	isStatic    bool
	headerOrder []string
}

func NewHeaderAccumulator(inferTypes bool, staticHeaders []string) *HeaderAccumulator {
	h := &HeaderAccumulator{
		headers:     make(map[string]DataHeader),
		headerOrder: make([]string, 0),
		inferTypes:  inferTypes,
		isStatic:    false,
	}
	if staticHeaders != nil {
		h.isStatic = true
		for _, header := range staticHeaders {
			h.addHeader(header)
		}
	}
	return h
}

func (h *HeaderAccumulator) inspectRow(row map[string]interface{}) {
	if h.isStatic && !h.inferTypes {
		return
	}
	for key, value := range row {
		if !h.isStatic {
			h.addHeader(key)
		}
		if h.inferTypes {
			entry := h.headers[key]
			newType := h.reevaluateInferredType(value, entry)
			entry.InferredType = newType
			h.headers[key] = entry
		}
	}
}

func (h *HeaderAccumulator) evaluateInferredType(value interface{}) (string, error) {
	if _, ok := value.(bool); ok {
		return "boolean", nil
	}
	if _, ok := value.(float64); ok {
		return "number", nil
	}
	valueStr, ok := value.(string)
	if ok {
		if valueStr == "true" || valueStr == "false" {
			return "boolean", nil
		}
		_, err := strconv.ParseFloat(valueStr, 64)
		if err == nil {
			return "number", nil
		}

		_, err = time.Parse(time.RFC3339, valueStr)
		if err == nil {
			return "date", nil
		}
		var valueJson interface{}
		err = json.Unmarshal([]byte(valueStr), &valueJson)
		if err == nil {
			return "object", nil
		}
		return "string", nil
	}
	return "", errors.New("Could not infer type")
}

func (h *HeaderAccumulator) reevaluateInferredType(value interface{}, header DataHeader) string {
	currentType := header.InferredType
	newType, err := h.evaluateInferredType(value)
	if err == nil {
		if currentType == "" {
			return newType
		}
		if currentType == newType {
			return currentType
		}
	}
	return "string"
}

func (h *HeaderAccumulator) addHeader(name string) {
	if _, ok := h.headers[name]; !ok {
    h.headerOrder = append(h.headerOrder, name)
		h.headers[name] = DataHeader{Name: name}
	}
}

func (h *HeaderAccumulator) ToDataHeaders() DataHeaders {
	headers := DataHeaders{}
	for _, name := range h.headerOrder {
    header := h.headers[name]
		headers = append(headers, header)
	}
	return headers
}
