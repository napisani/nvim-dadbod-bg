import { useEffect, useMemo, useRef, useState } from 'react'
import { Prefix } from './Prefix'
import { Table } from './Table'
import { TableControls, TableSettings } from './TableControls'
import { AttributeMap, OutputType, SubQueryResults } from './query-results'
import { useFocus } from './useFocusState'
import { useGlobalSettings } from './useGlobalSettings'
import { useScrollTo } from './useScrollTo'

interface TableSubSectionProps {
  section: SubQueryResults
  index: number
  setDisplayType: (idx: number, type: OutputType) => void
}
export function DBOutSubSection({
  section,
  index,
  setDisplayType,
}: TableSubSectionProps) {
  const { globalSettings } = useGlobalSettings()
  const [settings, setSettings] = useState<TableSettings>({
    collapsed: globalSettings.collapsed,
    tableTheme: globalSettings.tableTheme,
    gridCellHeightPx: globalSettings.gridCellHeightPx,
    filter: '',
    applyFilter: true,
  })

  useEffect(() => {
    setSettings({
      ...settings,
      // if the global settings change -- override the local settings with the global settings
      // so that you can see the changes made immediately. Then each section can have its own settings after that.
      tableTheme: globalSettings.tableTheme,
      collapsed: globalSettings.collapsed,
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

  const filteredContent = useMemo(() => {
    if (
      (settings.filter ?? '').trim() === '' ||
      !Array.isArray(section.content)
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
  }, [section.content, settings.filter])

  const table = useMemo(() => {
    return (
      <Table
        content={filteredContent as AttributeMap[]}
        headers={section.header!}
        settings={settings}
      />
    )
  }, [filteredContent, section.header, settings])

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
            <TableControls
              settings={settings}
              onChange={setSettings}
              onDisplayTypeChange={(type) => {
                setDisplayType(index, type)
              }}
            />
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
