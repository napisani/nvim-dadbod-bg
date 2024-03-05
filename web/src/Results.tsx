import { useState } from 'react'
import { JSONSubSection } from './JSONSubSection'
import { DBOutSubSection } from './TableSubSection'
import { TextSubSection } from './TextSubSection'
import { OutputType, TypedQueryResults } from './query-results'
import { useGlobalSettings } from './useGlobalSettings'

import { StatusPill } from './StatusPill'
export function Results({
  results,
  webSocketStatus,
}: {
  webSocketStatus: string
  results?: TypedQueryResults | null
}) {
  const { globalSettings } = useGlobalSettings()
  const [displayType, setDisplayType] = useState<{
    [idx: number]: OutputType
  }>({})

  return (
    <>
      <h1
        style={{
          margin: '.5rem',
          paddingBottom: '.5rem',
        }}
      >
        Query results updated:{' '}
        <StatusPill
          parsedAt={results?.parsedAt}
          receivedAt={results?.receivedAt}
          webSocketStatus={webSocketStatus}
        />
      </h1>
      <div
        className="output-container"
        style={{
          gridTemplateColumns: `repeat(${globalSettings.gridCellsPerRow}, 1fr)`,
        }}
      >
        {results?.content.map((section, index) => {
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
          if (type === 'dbout' || type === 'csv') {
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
