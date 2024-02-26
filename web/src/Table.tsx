import 'ag-grid-community/styles/ag-grid.css' // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.min.css'
import 'ag-grid-community/styles/ag-theme-balham.min.css'
import 'ag-grid-community/styles/ag-theme-material.min.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { AgGridReact } from 'ag-grid-react' // AG Grid Component
import { TableSettings } from './TableControls'
import { AttributeMap, DataHeader, DataHeaders } from './query-results'
import { parseByInferredType } from './utils'

import { useMemo } from 'react'
export interface TableProps {
  content: AttributeMap[]
  headers: DataHeaders
  settings: TableSettings
}
const paginationPageSize = 10
const paginationPageSizeSelector = [10, 20, 50, 100, 200, 500, 1000]

export function Table({ content, headers, settings }: TableProps) {
  const columns = headers.map((header: DataHeader) => ({
    field: header.name,
  }))

  const data = useMemo(() => {
    const headerMap = new Map(headers.map((header) => [header.name, header]))
    return content.map((row: AttributeMap) =>
      Object.entries(row)
        .map(([column, value]: [string, any]) => {
          const inferredType = headerMap?.get(column)?.inferredType ?? 'string'
          const parsedValue = parseByInferredType(value, inferredType)
          return {
            [column]: parsedValue,
          }
        })
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    )
  }, [content, headers])

  return (
    <div
      style={{
        fontSize: '13px',
      }}
    >
      <div
        className={settings.tableTheme}
        style={{ height: '500px' }} // the grid will fill the size of the parent container
      >
        <AgGridReact
          rowData={data}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
        />
      </div>
    </div>
  )
}
