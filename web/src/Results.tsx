import { useMemo } from 'react'
import { JSONSubSection } from './JSONSubSection'
import { TextSubSection } from './TextSubSection'
import { parseJsonSections } from './json.util'
import { QueryResults } from './query-results'

export function Results({ results }: { results: QueryResults }) {
  const contentSections = useMemo(
    () => parseJsonSections(results),
    [results.content]
  )

  return (
    <>
      <h1>Query results</h1>
      <div>
        {contentSections.map((section, index) => {
          if (section.type === 'json') {
            return (
              <JSONSubSection key={index} index={index} section={section} />
            )
          }
          return <TextSubSection key={index} index={index} section={section} />
        })}
      </div>
    </>
  )
}
