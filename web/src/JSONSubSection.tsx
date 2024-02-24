import JsonView from '@uiw/react-json-view'
import { basicTheme } from '@uiw/react-json-view/basic'
import Mark from 'mark.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { JSONViewerControls, JSONViewerSettings } from './JSONViewerControls'
import { Prefix } from './Prefix'
import { SubQueryResults } from './query-results'
import { useScrollTo } from './useScrollTo'

export function JSONSubSection({
  section,
  focused,
}: {
  section: SubQueryResults
  focused: boolean
}) {
  const [settings, setSettings] = useState<JSONViewerSettings>({
    collapsed: 1,
    filter: '',
    applyFilter: true,
  })
  const searchNodeRef = useRef<HTMLDivElement>(null)
  useScrollTo({ focused, ref: searchNodeRef })

  const markInstance = useMemo(() => {
    if (!searchNodeRef.current) {
      return
    }
    return new Mark(searchNodeRef.current)
  }, [searchNodeRef.current])

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

  useEffect(() => {
    markInstance?.unmark({
      done: () => {
        if (!settings.filter) {
          return
        }
        if (settings.filter.trim() === '') {
          return
        }
        markInstance?.mark(settings.filter)
      },
    })
  }, [settings])

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
      <div className={`output-line ${focused ? 'focused' : ''}`}>
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
            <JSONViewerControls settings={settings} onChange={setSettings} />
          </div>
          <div ref={searchNodeRef}>{jsonView}</div>
        </div>
      </div>
    </>
  )
}
