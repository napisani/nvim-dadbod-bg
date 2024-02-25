import { useMemo } from 'react'
import { JSONSubSection } from './JSONSubSection'
import { TextSubSection } from './TextSubSection'
import { parseDBOutSections } from './dbout.util'
import { parseJsonSections } from './json.util'
import { QueryResults } from './query-results'
import { DBOutSubSection } from './TableSubSection'

export function Results({ results }: { results: QueryResults }) {
  const contentSections = useMemo(() => {
    if (results.type === 'json') {
      return parseJsonSections(results)
    } else if (results.type === 'txt') {
      // TODO
    } else if (results.type === 'dbout') {
      return parseDBOutSections(results)
    }
    return []
  }, [results.content])

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
          if (section.type === 'dbout') {
            return (
              <DBOutSubSection key={index} index={index} section={section} />
            )
          }
          return <TextSubSection key={index} index={index} section={section} />
        })}
      </div>
    </>
  )
}
