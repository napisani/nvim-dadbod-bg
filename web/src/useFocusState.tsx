import { createContext, useContext, useEffect, useRef, useState } from 'react'

export interface FocusContextProps {
  focusedRow: number | null
  setFocusedRow: (row: number | null) => void
  subSectionRefs: React.MutableRefObject<HTMLDivElement[]>
}
const FocusContext = createContext<FocusContextProps>({
  focusedRow: null,
  setFocusedRow: () => {},
  subSectionRefs: { current: [] },
})

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [focusedRow, setFocusedRow] = useState<number | null>(null)
  const subSectionRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        // don't hijack input fields
        return
      }
      const row = focusedRow
      const len = subSectionRefs.current.length
      if (e.key === 'j') {
        e.preventDefault()
        setFocusedRow(row === null ? 0 : (row + 1) % len)
      } else if (e.key === 'k') {
        e.preventDefault()
        setFocusedRow(row === null ? 0 : (row - 1) % len)
      } else if (e.key === 'Tab' || e.key === '/') {
        e.preventDefault()
        if (row !== null && row !== undefined) {
          const focusedSubSection = subSectionRefs.current[row].parentElement
          const focusableElements =
            focusedSubSection?.querySelectorAll('.filter-input') ?? []
          if (focusableElements.length > 0) {
            const [first] = focusableElements
            if (first instanceof HTMLInputElement) {
              first.focus()
            }
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return (
    <FocusContext.Provider
      value={{
        focusedRow,
        setFocusedRow,
        subSectionRefs,
      }}
    >
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const { focusedRow, setFocusedRow, subSectionRefs } = useContext(FocusContext)
  const registerSubSectionRef = (ref: HTMLDivElement, index: number) => {
    subSectionRefs.current[index] = ref
  }

  return {
    focusedRow,
    setFocusedRow,
    registerSubSectionRef,
  }
}
