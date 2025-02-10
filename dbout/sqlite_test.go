package dbout

import (
	"io/ioutil"
	"reflect"
	"testing"
)

func TestParseDBOutTables_SQLite(t *testing.T) {
	content, err := ioutil.ReadFile("../test_data/sqlite.dbout")
	if err != nil {
		t.Fatalf("Failed to read test data: %v", err)
	}

	tables := ParseDBOutTables(string(content))
	if len(tables) == 0 {
		t.Errorf("Expected tables, got none")
	}

	populated := []Table{}
	for _, table := range tables {
		if table.HasHeader() && !table.IsEmpty() {
			populated = append(populated, table)
		}
	}

	if len(populated) != 1 {
		t.Errorf("Expected 1 table, got %d", len(tables))
	}

	expectedHeader := []string{"id", "name", "age", "email"}
	if !reflect.DeepEqual(populated[0].Header, expectedHeader) {
		t.Errorf("Expected header %v, got %v", expectedHeader, populated[0].Header)
	}

	expectedRowCount := 10
	if len(populated[0].Rows) != expectedRowCount {
		t.Errorf("Expected %d rows, got %d", expectedRowCount, len(populated[0].Rows))
	}
}
