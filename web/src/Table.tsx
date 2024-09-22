import 'ag-grid-community/styles/ag-grid.css' // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.min.css'
import 'ag-grid-community/styles/ag-theme-balham.min.css'
import 'ag-grid-community/styles/ag-theme-material.min.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { AgGridReact } from 'ag-grid-react' // AG Grid Component
import { TableSettings } from './TableControls'
import { AttributeMap, DataHeader, DataHeaders } from './query-results'
import { parseByInferredType } from './utils'

import { useMemo, useRef } from 'react'
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
    editable: true,
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

  const grid = useRef<AgGridReactType>(null)

  const copyAllRowsToClipboard = _ => {
    grid.current.api.selectAll()
    copySelectedRowsToClipboard()
  }

  const copySelectedRowsToClipboard = _ => {
    const copyFormat = document.getElementById('copyformat').value
    const copyHeaders = document.getElementById('copyheaders').checked
    const rows = grid.current.api.getSelectedRows()

    const columnNames = grid.current.api.getAllDisplayedColumns()
      .map(x => x.colId)

    if (copyHeaders && copyFormat !== 'json') {
      let row = {}
      for (const name of columnNames) {
        row[name] = name
      }
      rows.unshift(row)
    }

    let text = ''
    switch (copyFormat) {
      case 'html':
        text = buildTableHtml(columnNames, rows)
        break
      case 'csv':
        text = formatCsv(columnNames, rows)
        break
      case 'tab':
        text = formatTabSeparated(columnNames, rows)
        break
      case 'json':
        text = JSON.stringify(rows)
        break
    }

    const span = document.createElement('span')
    span.style.cssText = 'position:fixed;left:0;top:0;opacity:0;'
    span.innerHTML = text
    document.body.appendChild(span)
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(span)
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand('copy')
    document.body.removeChild(span)
  }
  
  return (
    <div
      style={{
        fontSize: '13px',
      }}
    >
      <div
        className={settings.tableTheme}
        style={{ height: `${settings.gridCellHeightPx}px` }} // the grid will fill the size of the parent container
      >
        <AgGridReact
          ref={grid}
          rowData={data}
          rowSelection={'multiple'}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
        />
      </div>

      <button onClick={_ => copySelectedRowsToClipboard()}>Copy Selected Rows</button>
      <button onClick={_ => copyAllRowsToClipboard()}>Copy All Rows</button>
      <select id="copyformat">
        <option value="html">HTML Table</option>
        <option value="csv">CSV</option>
        <option value="tab">Tab Separated</option>
        <option value="json">JSON</option>
      </select>
      <label>
        <input type="checkbox" id="copyheaders" defaultChecked />
        Copy header values
      </label>
    </div>
  )
}

const buildTableHtml = (columnNames, rows) => {
  return '<table>' + rows
    .map(x => '<tr>' + columnNames.map(y => `<td>${x[y]}</td>`).join('') + '</tr>').join('')
    + '</table>'
}

const formatTabSeparated = (columnNames, rows) => {
  return '<pre>' + rows
    //.map(x => Object.keys(x).map(y => x[y]))
    .map(x => columnNames.map(y => x[y]))
    .map(x => x.join('\t'))
    .join('\n')
    + '</pre>'
}

const formatCsv = (columnNames, rows) => {
  return '<pre>' + rows
    .map(x => columnNames.map(y => `"${x[y.replace('"', '\"')]}"`))
    .map(x => x.join(','))
    .join('\n')
    + '</pre>'
}
