import { useEffect, useMemo, useRef, useState } from 'react'
import { Prefix } from './Prefix'
import { TextViewerControls, TextViewerSettings } from './TextViewerControls'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'

import { newlineRegex } from './json-parser.util'
import { useFocus } from './useFocusState'
import { useMarker } from './useMarker'
export function TextSubSection({
  section,
  index,
}: {
  section: SubQueryResults
  index: number
}) {
  const [settings, setSettings] = useState<TextViewerSettings>({
    filter: '',
    applyFilter: true,
  })
  const searchNodeRef = useRef<HTMLDivElement>(null)
  const { registerSubSectionRef, focusedRow, setFocusedRow } = useFocus()
  useEffect(() => {
    if (searchNodeRef.current === null) {
      return
    }
    registerSubSectionRef(searchNodeRef.current, index)
  }, [index, registerSubSectionRef])

  const focused = focusedRow === index

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
    <div
      onClick={() => {
        setFocusedRow(index)
      }}
      className={`output-line ${focused ? 'focused' : ''}`}
    >
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
            tabIndex={-1}
          >
            {filteredContent}
          </pre>
        </div>
      </div>
    </div>
  )
}
