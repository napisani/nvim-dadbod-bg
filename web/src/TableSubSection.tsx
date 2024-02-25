import { useEffect, useMemo, useRef, useState } from 'react'
import { Prefix } from './Prefix'
import { Table } from './Table'
import { TableControls, TableSettings } from './TableControls'
import { AttributeMap, SubQueryResults } from './query-results'
import { useFocus } from './useFocusState'
import { useGlobalSettings } from './useGlobalSettings'
import { useMarker } from './useMarker'
import { useScrollTo } from './useScrollTo'

export function DBOutSubSection({
  section,
  index,
}: {
  section: SubQueryResults
  index: number
}) {
  const { globalSettings } = useGlobalSettings()
  const [settings, setSettings] = useState<TableSettings>({
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
      return Object.values(item).some((value) => {
        return (value ?? '')
          .toString()
          .toLowerCase()
          .includes(settings.filter!.toLowerCase())
      })
    })
  }, [section.content, settings.filter, settings.applyFilter])

  const table = useMemo(() => {
    return (
      <Table
        content={filteredContent as AttributeMap[]}
        headers={section.header!}
      />
    )
  }, [filteredContent, section.header])

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
            <TableControls settings={settings} onChange={setSettings} />
          </div>
          <div
            style={{
              marginTop: '0.5rem',
            }}
            ref={searchNodeRef}
          >
            {table}
          </div>
        </div>
      </div>
    </>
  )
}