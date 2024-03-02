import { DisplayTypeControls } from './DisplayTypeControls'
import { FilterControls } from './FilterControls'
import { OutputType } from './query-results'
import { debounce } from './utils'

export interface TableControlsProps {
  settings: TableSettings
  onChange: (settings: TableSettings) => void
  onDisplayTypeChange: (type: OutputType) => void
}

export interface TableSettings {
  collapsed: number | boolean
  filter: string
  applyFilter: boolean
  tableTheme: string
  gridCellHeightPx: number
}

export function TableControls({
  settings,
  onChange,
  onDisplayTypeChange,
}: TableControlsProps) {
  const debouncedOnChange = debounce(onChange, 500)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'right',
      }}
    >
      <DisplayTypeControls
        displayType="dbout"
        displayTypeOptions={['json', 'dbout']}
        setDisplayType={onDisplayTypeChange}
      />
      <FilterControls
        setFilter={(filter) => {
          debouncedOnChange({ ...settings, filter })
        }}
        hideApplyFilter={true}
      />
    </div>
  )
}
