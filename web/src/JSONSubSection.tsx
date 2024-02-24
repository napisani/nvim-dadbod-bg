import JsonView from '@uiw/react-json-view'
import { useEffect, useMemo, useRef, useState } from 'react'
import { JSONViewerControls, JSONViewerSettings } from './JSONViewerControls'
import { Prefix } from './Prefix'
import { SubQueryResults } from './query-results'
import { useFocus } from './useFocusState'
import { useGlobalSettings } from './useGlobalSettings'
import { useMarker } from './useMarker'
import { useScrollTo } from './useScrollTo'

import { jsonViewerThemes } from './json.util'

export function JSONSubSection({
  section,
  index,
}: {
  section: SubQueryResults
  index: number
}) {
  const { globalSettings } = useGlobalSettings()
  const [settings, setSettings] = useState<JSONViewerSettings>({
    collapsed: globalSettings.collapsed,
    theme: globalSettings.theme,
    filter: '',
    applyFilter: true,
  })

  useEffect(() => {
    setSettings({
      ...settings,
      // if the global settings change -- override the local settings with the global settings
      // so that you can see the changes made immediately. Then each section can have its own settings after that.
      theme: globalSettings.theme,
      collapsed: globalSettings.collapsed,
      applyFilter: globalSettings.applyFilter,
    })
  }, [globalSettings])

  const theme = useMemo(() => {
    return jsonViewerThemes[settings.theme] ?? jsonViewerThemes.basicTheme
  }, [settings.theme])

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
        style={theme}
        collapsed={settings.collapsed}
        value={filteredContent as object}
      />
    )
  }, [filteredContent, settings.collapsed, theme])

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
            <JSONViewerControls settings={settings} onChange={setSettings} />
          </div>
          <div ref={searchNodeRef}>{jsonView}</div>
        </div>
      </div>
    </>
  )
}
