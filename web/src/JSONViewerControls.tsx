import { useRef } from 'react'
import { FilterControls } from './FilterControls'
import {
  booleanOrNumberToString,
  debounce,
  stringToBooleanOrNumber,
} from './utils'
import { DisplayTypeControls } from './DisplayTypeControls'
import { OutputType } from './query-results'

export interface JSONViewerControlsProps {
  settings: JSONViewerSettings
  onChange: (settings: JSONViewerSettings) => void
  onDisplayTypeChange: (type: OutputType) => void
}

export interface JSONViewerSettings {
  collapsed: number | boolean
  filter: string
  applyFilter: boolean
  jsonTheme: string
  showMoreAmount: number
}

const labelStyle = {
  fontSize: 14,
  marginLeft: 10,
}

export function JSONViewerControls({
  settings,
  onChange,
  onDisplayTypeChange,
}: JSONViewerControlsProps) {
  const debouncedOnChange = debounce(onChange, 500)
  const collapsedRef = useRef<HTMLSelectElement>(null)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'right',
      }}
    >
      <DisplayTypeControls
        displayType="json"
        displayTypeOptions={['json', 'dbout']}
        setDisplayType={onDisplayTypeChange}
      />
      <label style={labelStyle}>
        Collapsed:
        <select
          ref={collapsedRef}
          style={{ marginLeft: 10 }}
          value={booleanOrNumberToString(settings.collapsed)}
          onChange={(e) => {
            onChange({
              ...settings,
              collapsed: stringToBooleanOrNumber(e.target.value),
            })
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              collapsedRef.current?.blur()
            }
          }}
        >
          <option value="true">Collapse All</option>
          <option value="false">Expand All</option>
          <option value={1}>Expand 1 - level</option>
          <option value={2}>Expand 2 - levels</option>
          <option value={3}>Expand 3 - levels</option>
          <option value={4}>Expand 4 - levels</option>
        </select>
      </label>

      <FilterControls
        setFilter={(filter) => {
          debouncedOnChange({ ...settings, filter })
        }}
        applyFilter={settings.applyFilter}
        setApplyFilter={(applyFilter) => {
          onChange({ ...settings, applyFilter })
        }}
      />
    </div>
  )
}
