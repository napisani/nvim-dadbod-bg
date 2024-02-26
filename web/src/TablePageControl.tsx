import { Table } from '@tanstack/react-table'

const buttonStyle = {
  border: '1px solid black',
  borderRadius: '5px',
  padding: '5px',
}
export function TablePageControl({ table }: { table: Table<any> }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '.5rem',
        marginTop: '5px',
      }}
    >
      <button
        style={buttonStyle}
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        {'<<'}
      </button>
      <button
        style={buttonStyle}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<'}
      </button>
      <button
        style={buttonStyle}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>'}
      </button>
      <button
        style={buttonStyle}
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        {'>>'}
      </button>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginLeft: '1rem',
          marginRight: '1rem',
        }}
      >
        <div>Page:</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value))
        }}
      >
        {[10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  )
}
