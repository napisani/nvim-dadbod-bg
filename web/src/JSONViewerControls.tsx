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

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: any
  return function (this: any, ...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  } as any
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
          style={{ marginLeft: 10 }}
          tabIndex={3}
          value={toString(settings.collapsed)}
          onChange={(e) => {
            onChange({
              ...settings,
              collapsed: toBooleanOrNumber(e.target.value),
            })
          }}
        >
          <option value="true">Collapse All</option>
          <option value="false">Expand All</option>
          <option value={1}>Expand 1 - level</option>
          <option value={2}>Expand 2 - levels</option>
        </select>
      </label>

      <label style={labelStyle}>
        Apply Filter:
        <input
          style={{ marginLeft: 10 }}
          tabIndex={2}
          type="checkbox"
          checked={settings.applyFilter}
          onChange={(e) => {
            onChange({
              ...settings,
              applyFilter: e.target.checked,
            })
          }}
        />
      </label>

      <label style={labelStyle}>
        Search:
        <input
          style={{ marginLeft: 10 }}
          tabIndex={1}
          onChange={(e) => {
            debouncedOnChange({
              ...settings,
              filter: e.target.value,
            })
          }}
        />
      </label>
    </div>
  )
}
