import JsonView from '@uiw/react-json-view'
import { basicTheme } from '@uiw/react-json-view/basic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { JSONViewerControls, JSONViewerSettings } from './JSONViewerControls'
import { Prefix } from './Prefix'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'
import { useMarker } from './useMarker'
import { useFocus } from './useFocusState'

export function JSONSubSection({
  section,
  index,
}: {
  section: SubQueryResults
  index: number
}) {
  const [settings, setSettings] = useState<JSONViewerSettings>({
    collapsed: 1,
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
    if (
      (settings.filter ?? '').trim() === '' ||
      !Array.isArray(section.content) ||
      !settings.applyFilter
    ) {
      return section.content
    }
    return section.content.filter((item) => {
      return JSON.stringify(item).includes(settings.filter!)
    })
  }, [section.content, settings.filter, settings.applyFilter])

  const jsonView = useMemo(() => {
    return (
      <JsonView
        style={basicTheme}
        collapsed={settings.collapsed}
        value={filteredContent as object}
      />
    )
  }, [filteredContent, settings.collapsed])

  return (
    <>
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
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'right',
            }}
          >
            <JSONViewerControls
              settings={settings}
              onChange={setSettings}
            />
          </div>
          <div ref={searchNodeRef}>{jsonView}</div>
        </div>
      </div>
    </>
  )
}
