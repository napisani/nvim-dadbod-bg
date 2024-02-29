import { JSONSubSection } from './JSONSubSection'
import { DBOutSubSection } from './TableSubSection'
import { TextSubSection } from './TextSubSection'
import { TypedQueryResults } from './query-results'

export function Results({ results }: { results: TypedQueryResults }) {
  return (
    <>
      <h1>Query results</h1>
      <div>
        {results.content.map((section, index) => {
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
