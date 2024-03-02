import { useEffect, useMemo, useRef, useState } from 'react'

import { JSONViewerControls, JSONViewerSettings } from './JSONViewerControls'
import { Prefix } from './Prefix'
import { OutputType, SubQueryResults } from './query-results'
import { useFocus } from './useFocusState'
import { useGlobalSettings } from './useGlobalSettings'
import { useMarker } from './useMarker'
import { useScrollTo } from './useScrollTo'

import { JSONTree, KeyPath } from 'react-json-tree'
import { buildPathStringFromPathArray, jsonViewerThemes } from './json.util'

import { useJsonContentLimiter } from './useJsonContentLimiter'
import { trimQuotes } from './utils'
interface JSONSubSectionProps {
  section: SubQueryResults
  index: number
  setDisplayType: (idx: number, type: OutputType) => void
}
export function JSONSubSection({
  section,
  index,
  setDisplayType,
}: JSONSubSectionProps) {
  const { globalSettings } = useGlobalSettings()
  const [settings, setSettings] = useState<JSONViewerSettings>({
    collapsed: globalSettings.collapsed,
    jsonTheme: globalSettings.jsonTheme,
    filter: '',
    applyFilter: true,
    showMoreAmount: globalSettings.showMoreAmount,
  })

  useEffect(() => {
    setSettings({
      ...settings,
      // if the global settings change -- override the local settings with the global settings
      // so that you can see the changes made immediately. Then each section can have its own settings after that.
      jsonTheme: globalSettings.jsonTheme,
      collapsed: globalSettings.collapsed,
      applyFilter: globalSettings.applyFilter,
    })
  }, [globalSettings])

  const theme = useMemo(() => {
    return jsonViewerThemes[settings.jsonTheme]
  }, [settings.jsonTheme])

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

  const {
    limitedContent: filteredAndLimitedContent,
    containsLimitToken,
    addToLimitForKeyPath,
    replaceLimitToken,
  } = useJsonContentLimiter({
    defaultLimit: 20,
    content: filteredContent,
  })

  const jsonView = useMemo(() => {
    return (
      <JSONTree
        key={'json-viewer' + settings.collapsed.toString()}
        theme={theme}
        data={filteredAndLimitedContent}
        shouldExpandNodeInitially={(_keyName, _data, level) => {
          if (settings.collapsed === false) {
            return true
          } else if (settings.collapsed === true) {
            return false
          }
          return level <= (settings.collapsed as number)
        }}
        labelRenderer={(keyPath: KeyPath) => {
          const [key] = keyPath

          if (containsLimitToken(key?.toString())) {
            return <strong></strong>
          }

          const pathString = buildPathStringFromPathArray(
            keyPath.slice().reverse().slice(1) as (string | number)[]
          )
          return <strong title={pathString}>{key}</strong>
        }}
        valueRenderer={(raw, ...keyPath) => {
          if (typeof raw === 'string' && containsLimitToken(raw)) {
            return (
              <button
                onClick={() => {
                  const path = keyPath.slice(2, -1).reverse()
                  addToLimitForKeyPath(path, settings.showMoreAmount)
                }}
              >
                {trimQuotes(replaceLimitToken(raw))}
              </button>
            )
          }
          return (
            <>
              <span className="unhide-trigger-inline" onClick={() => {}}>
                {raw as any}

                <span
                  className="hide"
                  style={{
                    marginLeft: '10px',
                  }}
                >
                  <button
                    style={{
                      marginRight: '5px',
                      fontSize: '9px',
                      padding: '0px',
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        trimQuotes(raw?.toString() ?? 'undefined')
                      )
                    }}
                  >
                    copy value
                  </button>
                  <button
                    style={{
                      fontSize: '9px',
                      padding: '0px',
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        buildPathStringFromPathArray(
                          keyPath.slice(1).reverse().slice(1) as (
                            | string
                            | number
                          )[]
                        )
                      )
                    }}
                  >
                    copy path
                  </button>
                </span>
              </span>
            </>
          )
        }}
      ></JSONTree>
    )
  }, [
    filteredAndLimitedContent,
    containsLimitToken,
    addToLimitForKeyPath,
    settings,
  ])

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
              marginTop: '0.5rem',
            }}
          >
            <JSONViewerControls
              settings={settings}
              onChange={setSettings}
              onDisplayTypeChange={(type) => {
                setDisplayType(index, type)
              }}
            />
          </div>
          <div
            style={{
              height: `${globalSettings.gridCellHeightPx}px`,
            }}
            ref={searchNodeRef}
          >
            {jsonView}
          </div>
        </div>
      </div>
    </>
  )
}
