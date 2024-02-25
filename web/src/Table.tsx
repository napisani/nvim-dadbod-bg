import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { AttributeMap, DataHeader, DataHeaders } from './query-results'
export interface TableProps {
  content: AttributeMap[]
  headers: DataHeaders
}

const borderColor = 'grey'
export function Table({ content, headers }: TableProps) {
  const columnHelper = createColumnHelper<any>()

  const columns = headers.map((header: DataHeader) =>
    columnHelper.accessor(header.name, {
      cell: (info) => <div>{info.getValue()}</div>,
      header: () => <span>{header.name}</span>,
    })
  )

  // const rerender = useReducer(() => ({}), {})[1]

  const table = useReactTable({
    data: content,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <table
        border={1}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderRadius: '5px',
          borderColor,
          fontSize: '13px',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{
                borderColor,
              }}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    borderColor,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              style={{
                borderColor,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  style={{
                    borderColor,
                    padding: '4px',
                  }}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-4" />
    </div>
  )
}
