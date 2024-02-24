import { useRef } from 'react'
import { Prefix } from './Prefix'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'

export function TextSubSection({
  section,
  focused,
}: {
  section: SubQueryResults
  focused: boolean
}) {
  const searchNodeRef = useRef<HTMLDivElement>(null)
  useScrollTo({ focused, ref: searchNodeRef })
  return (
    <div className={`output-line ${focused ? 'focused' : ''}`}>
      <Prefix prefix={section.prefix} />
      <div
        ref={searchNodeRef}
        style={{
          display: 'inline',
        }}
      >
        {section.content as string}
      </div>
    </div>
  )
}
