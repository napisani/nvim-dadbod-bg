package dbout

import (
	"io/ioutil"
	"reflect"
	"testing"
)

func TestParseDBOutTables_MySQL(t *testing.T) {
	content, err := ioutil.ReadFile("../test_data/mysql2.dbout")
	if err != nil {
		t.Fatalf("Failed to read test data: %v", err)
	}

	tables := ParseDBOutTables(string(content))
	if len(tables) == 0 {
		t.Errorf("Expected tables, got none")
	}

	if len(tables) != 2 {
		t.Errorf("Expected 2 tables, got %d", len(tables))
	}

	expectedHeader := []string{"ID", "Name"}
	if !reflect.DeepEqual(tables[0].Header, expectedHeader) {
		t.Errorf("Expected header %v, got %v", expectedHeader, tables[0].Header)
	}

	expectedRowCount := 2
	if len(tables[0].Rows) != expectedRowCount {
		t.Errorf("Expected %d rows, got %d", expectedRowCount, len(tables[0].Rows))
	}
}
