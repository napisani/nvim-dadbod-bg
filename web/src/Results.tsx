import { useState } from 'react'
import { JSONSubSection } from './JSONSubSection'
import { DBOutSubSection } from './TableSubSection'
import { TextSubSection } from './TextSubSection'
import { TypedQueryResults } from './query-results'
import { useGlobalSettings } from './useGlobalSettings'

export function Results({ results }: { results: TypedQueryResults }) {
  const { globalSettings } = useGlobalSettings()
  const [displayType, setDisplayType] = useState<{
    [idx: number]: 'dbout' | 'json'
  }>({})

  return (
    <>
      <h1
        style={{
          margin: '.5rem',
        }}
      >
        Query results
      </h1>
      <div
        className="output-container"
        style={{
          gridTemplateColumns: `repeat(${globalSettings.gridCellsPerRow}, 1fr)`,
        }}
      >
        {results.content.map((section, index) => {
          const type = displayType[index] ?? section.type
          if (type === 'json') {
            return (
              <JSONSubSection
                key={index}
                index={index}
                section={section}
                setDisplayType={(idx, type) => {
                  setDisplayType({ ...displayType, [idx]: type })
                }}
              />
            )
          }
          if (type === 'dbout') {
            return (
              <DBOutSubSection
                key={index}
                index={index}
                section={section}
                setDisplayType={(idx, type) => {
                  setDisplayType({ ...displayType, [idx]: type })
                }}
              />
            )
          }
          return <TextSubSection key={index} index={index} section={section} />
        })}
      </div>
    </>
  )
}
