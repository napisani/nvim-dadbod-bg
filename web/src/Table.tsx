import React, { useMemo, useState, useCallback } from 'react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.min.css'
import 'ag-grid-community/styles/ag-theme-balham.min.css'
import 'ag-grid-community/styles/ag-theme-material.min.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { AgGridReact } from 'ag-grid-react'
import { TableSettings } from './TableControls'
import { AttributeMap, DataHeader, DataHeaders } from './query-results'
import { parseByInferredType } from './utils'
import { ExportTableRows } from './ExportTableRows'

export interface TableProps {
  content: AttributeMap[]
  headers: DataHeaders
  settings: TableSettings
}

const paginationPageSize = 10
const paginationPageSizeSelector = [10, 20, 50, 100, 200, 500, 1000]

export function Table({ content, headers, settings }: TableProps) {
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([])

  const columns = useMemo(
    () => [
      {
        headerName: '',
        field: 'selection',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left' as const,
      },
      ...headers.map((header: DataHeader) => ({
        field: header.name,
      })),
    ],
    [headers]
  )

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

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current.api.getSelectedNodes()
    const selectedData = selectedNodes.map(
      (node: { data: Record<string, any> }) => node.data
    )
    setSelectedRows(selectedData)
    console.log('Selected row:', selectedData[selectedData.length - 1])
  }, [])

  const gridRef = React.useRef<any>()

  return (
    <div
      style={{
        fontSize: '13px',
      }}
    >
      <div
        className={settings.tableTheme}
        style={{ height: `${settings.gridCellHeightPx}px` }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
        />
      </div>
      <ExportTableRows headers={headers} selectedRows={selectedRows} />
    </div>
  )
}
