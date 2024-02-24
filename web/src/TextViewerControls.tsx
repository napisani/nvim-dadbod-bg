import { FilterControls } from './FilterControls'
import { debounce } from './utils'

export interface TextViewerControlsProps {
  settings: TextViewerSettings
  focused: boolean
  onChange: (settings: TextViewerSettings) => void
}

export interface TextViewerSettings {
  filter: string
  applyFilter: boolean
}

export function TextViewerControls({
  settings,
  focused,
  onChange,
}: TextViewerControlsProps) {
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
        filter={settings.filter}
        focused={focused}
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
