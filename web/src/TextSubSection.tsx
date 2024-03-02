import { useEffect, useMemo, useRef, useState } from 'react'
import { Prefix } from './Prefix'
import { TextViewerControls, TextViewerSettings } from './TextViewerControls'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'

import { useFocus } from './useFocusState'
import { useGlobalSettings } from './useGlobalSettings'
import { useMarker } from './useMarker'
import { newlineRegex } from './utils'
export function TextSubSection({
  section,
  index,
}: {
  section: SubQueryResults
  index: number
}) {
  const { globalSettings } = useGlobalSettings()
  const [settings, setSettings] = useState<TextViewerSettings>({
    filter: '',
    applyFilter: true,
  })

  useEffect(() => {
    setSettings({
      ...settings,
      // if the global settings change -- override the local settings with the global settings
      // so that you can see the changes made immediately. Then each section can have its own settings after that.
      applyFilter: globalSettings.applyFilter,
    })
  }, [globalSettings])

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
      <div
        style={{
          width: '100%',
          overflow: 'scroll',
          marginTop: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'right',
          }}
        >
          <TextViewerControls settings={settings} onChange={setSettings} />
        </div>
        <Prefix prefix={section.prefix} />
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
