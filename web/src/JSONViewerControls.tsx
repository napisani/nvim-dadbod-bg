import { useRef } from 'react'
import { FilterControls } from './FilterControls'
import { debounce } from './utils'

export interface JSONViewerControlsProps {
  settings: JSONViewerSettings
  onChange: (settings: JSONViewerSettings) => void
}

export interface JSONViewerSettings {
  collapsed: number | boolean
  filter: string
  applyFilter: boolean
}

function toString(collapsed: number | boolean) {
  return `${collapsed}`
}

function toBooleanOrNumber(value: string) {
  if (value === 'true' || value === 'false') {
    return value === 'true'
  }
  return parseInt(value)
}

const labelStyle = {
  fontSize: 14,
  marginLeft: 10,
}

export function JSONViewerControls({
  settings,
  onChange,
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
      <label style={labelStyle}>
        Collapsed:
        <select
          ref={collapsedRef}
          style={{ marginLeft: 10 }}
          value={toString(settings.collapsed)}
          onChange={(e) => {
            onChange({
              ...settings,
              collapsed: toBooleanOrNumber(e.target.value),
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
