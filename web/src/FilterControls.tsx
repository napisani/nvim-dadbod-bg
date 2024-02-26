import { useRef } from 'react'

const labelStyle = {
  fontSize: 14,
  marginLeft: 10,
}
function keyDownHandler(
  element: HTMLInputElement,
  e: React.KeyboardEvent<HTMLInputElement>
) {
  if (e.key === 'Escape') {
    e.preventDefault()
    element.blur()
  } else if (e.key === 'Tab') {
    e.preventDefault()
    element.blur()
  }
}

export function FilterControls({
  applyFilter,
  setApplyFilter,
  setFilter,
  hideApplyFilter,
}: {
  setFilter: (filter: string) => void
  applyFilter?: boolean
  setApplyFilter?: (applyFilter: boolean) => void
  hideApplyFilter?: boolean
}) {
  const filterRef = useRef<HTMLInputElement>(null)
  const checkboxRef = useRef<HTMLInputElement>(null)
  return (
    <>
      {!hideApplyFilter && (
        <label style={labelStyle}>
          Apply Filter:
          <input
            ref={checkboxRef}
            style={{ marginLeft: 10 }}
            type="checkbox"
            checked={applyFilter}
            onChange={(e) => {
              if (setApplyFilter) {
                setApplyFilter(e.target.checked)
              }
            }}
            onKeyDown={keyDownHandler.bind(null, checkboxRef.current!)}
          />
        </label>
      )}

      <label style={labelStyle}>
        Search:
        <input
          style={{ marginLeft: 10 }}
          ref={filterRef}
          className={'filter-input'}
          type="text"
          onChange={(e) => {
            setFilter(e.target.value)
          }}
          onKeyDown={keyDownHandler.bind(null, filterRef.current!)}
        />
      </label>
    </>
  )
}
