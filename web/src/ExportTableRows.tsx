import { useCallback, useState } from 'react'
import { DataHeaders } from './query-results'

const exportToCSV = (
  rows: Record<string, any>[],
  headers: string[],
  includeHeader: boolean = true,
  separator = ','
): string => {
  const csvContent = [
    ...rows.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? '')).join(separator)
    ),
  ]
  if (includeHeader) {
    csvContent.unshift(headers.join(separator))
  }
  return csvContent.join('\n')
}

const exportToJSON = (rows: Record<string, any>[]): string => {
  return JSON.stringify(rows, null, 2)
}

function downloadStringAsFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ExportTableRows({
  selectedRows,
  headers,
}: Readonly<{
  selectedRows: Record<string, any>[]
  headers: DataHeaders
}>) {
  const [exportType, setExportType] = useState('csv')
  const [includeHeader, setIncludeHeader] = useState(true)

  const getRowsInFormat = useCallback(() => {
    if (selectedRows.length === 0) {
      return ''
    }

    const headerNames = headers.map((header) => header.name)

    switch (exportType) {
      case 'csv':
        return exportToCSV(selectedRows, headerNames, includeHeader, ',')
      case 'json':
        return exportToJSON(selectedRows)
      case 'tab':
        return exportToCSV(selectedRows, headerNames, includeHeader, '\t')
      default:
        throw new Error(`Unsupported export type: ${exportType}`)
    }
  }, [selectedRows, headers, exportType])

  const handleExport = useCallback(() => {
    const rowsInFormat = getRowsInFormat()
    const filename = `dbbg_export.${exportType}`
    const mimeType = `text/${exportType}`

    downloadStringAsFile(rowsInFormat, filename, mimeType)
  }, [getRowsInFormat, exportType])

  const copyToClipboard = useCallback(() => {
    const rowsInFormat = getRowsInFormat()
    navigator.clipboard.writeText(rowsInFormat)
  }, [getRowsInFormat])

  return (
    <div>
      <label
        style={{ display: 'inline-block', margin: '8px' }}
        htmlFor="exportType"
      >
        Export type:
      </label>
      <select
        style={{ display: 'inline-block', margin: '8px' }}
        disabled={selectedRows.length === 0}
        value={exportType}
        onChange={(e) => {
          setExportType(e.target.value)
        }}
        id="exportType"
        name="exportType"
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
        <option value="tab">Tab</option>
      </select>

      <label
        style={{ display: 'inline-block', margin: '8px' }}
        htmlFor="includeHeader"
      >
        Include header:
      </label>
      <input
        disabled={selectedRows.length === 0}
        id="includeHeader"
        type="checkbox"
        checked={includeHeader}
        onChange={(e) => setIncludeHeader(e.target.checked)}
      />
      <button
        style={{ display: 'inline-block', margin: '8px' }}
        disabled={selectedRows.length === 0}
        onClick={handleExport}
      >
        Export
      </button>
      <button
        style={{ display: 'inline-block', margin: '8px' }}
        disabled={selectedRows.length === 0}
        onClick={copyToClipboard}
      >
        Copy
      </button>
    </div>
  )
}
