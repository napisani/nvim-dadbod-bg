import { useMemo, useRef, useState } from 'react'
import { Prefix } from './Prefix'
import { TextViewerControls, TextViewerSettings } from './TextViewerControls'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'

import { useMarker } from './useMarker'
import { newlineRegex } from './json-parser.util'
export function TextSubSection({
  section,
  focused,
}: {
  section: SubQueryResults
  focused: boolean
}) {
  const [settings, setSettings] = useState<TextViewerSettings>({
    filter: '',
    applyFilter: true,
  })
  const searchNodeRef = useRef<HTMLDivElement>(null)
  useScrollTo({ focused, ref: searchNodeRef })
  useMarker({ searchNodeRef, settings })

  const filteredContent = useMemo(() => {
    if ((settings.filter ?? '').trim() === '' || !settings.applyFilter) {
      return section.content as string
    }
    return (section.content as string)
      .split(newlineRegex)
      .filter((item) => {
        return item.includes(settings.filter!)
      })
      .join('\n')
  }, [section.content, settings.filter, settings.applyFilter])

  return (
    <div className={`output-line ${focused ? 'focused' : ''}`}>
      <Prefix prefix={section.prefix} />
      <div
        style={{
          width: '100%',
          overflow: 'scroll',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'right',
          }}
        >
          <TextViewerControls
            focused={focused}
            settings={settings}
            onChange={setSettings}
          />
        </div>
        <div ref={searchNodeRef}>
          <pre
            style={{
              margin: 0,
              fontSize: 13,
            }}
          >
            {filteredContent}
          </pre>
        </div>
      </div>
    </div>
  )
}
