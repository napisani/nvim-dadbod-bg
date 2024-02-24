import { useEffect, useMemo, useState } from 'react'
import { JSONSubSection } from './JSONSubSection'
import { TextSubSection } from './TextSubSection'
import { parseJsonSections } from './json-parser.util'
import { QueryResults } from './query-results'

export function Results({ results }: { results: QueryResults }) {
  const [focusedRow, setFocusedRow] = useState<number | null>(null)
  const contentSections = useMemo(
    () => parseJsonSections(results),
    [results.content]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        // don't hijack input fields
        return
      }
      if (e.key === 'j') {
        e.preventDefault()
        setFocusedRow((row) =>
          row === null ? 0 : (row + 1) % contentSections.length
        )
      } else if (e.key === 'k') {
        e.preventDefault()
        setFocusedRow((row) =>
          row === null ? 0 : (row - 1) % contentSections.length
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })
  return (
    <>
      <div>
        {contentSections.map((section, index) => {
          if (section.type === 'json') {
            return (
              <JSONSubSection
                key={index}
                focused={focusedRow === index}
                section={section}
              />
            )
          }
          return (
            <TextSubSection
              key={index}
              focused={focusedRow === index}
              section={section}
            />
          )
        })}
      </div>
    </>
  )
}
