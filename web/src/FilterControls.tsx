import { useRef } from 'react'

const labelStyle = {
  fontSize: 14,
  marginLeft: 10,
}
export function FilterControls({
  focused,
  setFilter,
  applyFilter,
  setApplyFilter,
}: {
  focused: boolean
  filter: string
  setFilter: (filter: string) => void
  applyFilter: boolean
  setApplyFilter: (applyFilter: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const checkboxRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <label style={labelStyle}>
        Apply Filter:
        <input
          ref={checkboxRef}
          style={{ marginLeft: 10 }}
          tabIndex={-1}
          type="checkbox"
          checked={applyFilter}
          onChange={(e) => {
            setApplyFilter(e.target.checked)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              checkboxRef.current?.blur()
            }
          }}
        />
      </label>

      <label style={labelStyle}>
        Search:
        <input
          style={{ marginLeft: 10 }}
          ref={inputRef}
          tabIndex={focused ? 2 : -1}
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              inputRef.current?.blur()
            }
          }}
          onChange={(e) => {
            setFilter(e.target.value)
          }}
        />
      </label>
    </>
  )
}
