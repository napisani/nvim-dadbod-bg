import { useRef } from 'react'
import { OutputType } from './query-results'

const labelStyle = {
  fontSize: 14,
  marginLeft: 10,
}

export function DisplayTypeControls({
  displayType,
  displayTypeOptions,
  setDisplayType,
}: {
  displayType: OutputType
  displayTypeOptions: OutputType[]
  setDisplayType: (displayType: OutputType) => void
}) {
  const displayControl = useRef<HTMLSelectElement>(null)
  return (
    <>
      <label style={labelStyle}>
        Display as:
        <select
          ref={displayControl}
          style={{ marginLeft: 10 }}
          value={displayType}
          onChange={(e) => {
            setDisplayType(e.target.value as OutputType)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              displayControl.current?.blur()
            }
          }}
        >
          {displayTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}
