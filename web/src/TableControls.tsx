import { FilterControls } from './FilterControls'
import { debounce } from './utils'

export interface TableControlsProps {
  settings: TableSettings
  onChange: (settings: TableSettings) => void
}

export interface TableSettings {
  collapsed: number | boolean
  filter: string
  applyFilter: boolean
  tableTheme: string
}

export function TableControls({ settings, onChange }: TableControlsProps) {
  const debouncedOnChange = debounce(onChange, 500)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'right',
      }}
    >
      <FilterControls
        setFilter={(filter) => {
          debouncedOnChange({ ...settings, filter })
        }}
        hideApplyFilter={true}
      />
    </div>
  )
}
