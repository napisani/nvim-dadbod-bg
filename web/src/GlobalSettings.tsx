import { useState } from 'react'
import { tableThemes } from './dbout.util'
import {
  GloballyStoredSettings,
  defaultGlobalSettings,
  useGlobalSettings,
} from './useGlobalSettings'
import { booleanOrNumberToString, stringToBooleanOrNumber } from './utils'
import { jsonViewerThemes } from './json.util'

const labelStyle = {
  fontSize: 14,
}

export function GlobalSettings({ onSave }: { onSave?: () => void }) {
  const { globalSettings, saveAndApplySettings } = useGlobalSettings()
  const [settings, setSettings] = useState<GloballyStoredSettings>({
    ...globalSettings,
  })

  const handleSaveAndApply = (settings: GloballyStoredSettings) => {
    saveAndApplySettings(settings)
    if (onSave) {
      onSave()
    }
  }

  return (
    <>
      <div>
        <h1
          style={{
            margin: '.5rem',
          }}
        >
          Global Settings
        </h1>
      </div>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content max-content',
            gap: 20,
            margin: '.5em',
          }}
        >
          <div>
            <label
              title="The number of items to show when the user clicks the 'more' button in the JSON viewer"
              style={labelStyle}
            >
              JSON Viewer - Show &quot;more&quot; amount:
            </label>
          </div>
          <div>
            <input
              type="number"
              value={settings.showMoreAmount}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  showMoreAmount: parseInt(e.target.value),
                })
              }}
            />
          </div>
          <div>
            <label
              title="The number of levels to collapse by default in the JSON viewer"
              style={labelStyle}
            >
              JSON Viewer - Default collapsed:
            </label>
          </div>
          <div>
            <select
              value={booleanOrNumberToString(settings.collapsed)}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  collapsed: stringToBooleanOrNumber(e.target.value),
                })
              }}
            >
              <option value="true">Collapse All</option>
              <option value="false">Expand All</option>
              <option value={1}>Expand 1 - level</option>
              <option value={2}>Expand 2 - levels</option>
              <option value={3}>Expand 3 - levels</option>
              <option value={4}>Expand 4 - levels</option>
            </select>
          </div>
          <div>
            <label
              title="The theme to use for the JSON viewer"
              style={labelStyle}
            >
              JSON Viewer - Theme:
            </label>
          </div>
          <div>
            <select
              value={settings.jsonTheme}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  jsonTheme: e.target.value,
                })
              }}
            >
              {Object.keys(jsonViewerThemes)
                .sort()
                .map((theme) => {
                  return (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  )
                })}
            </select>
          </div>

          <div>
            <label title="The theme to use for the table" style={labelStyle}>
              Table theme:
            </label>
          </div>
          <div>
            <select
              value={settings.tableTheme}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  tableTheme: e.target.value,
                })
              }}
            >
              {tableThemes.sort().map((theme) => {
                return (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label
              title="Whether to apply the filter to the query results by default (or just highlight the matches)"
              style={labelStyle}
            >
              Default apply filter:
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              checked={settings.applyFilter}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  applyFilter: e.target.checked,
                })
              }}
            />
          </div>

          <div>
            <label
              title="The number of grid cells to show per row"
              style={labelStyle}
            >
              Grid cells per row:
            </label>
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={5}
              value={settings.gridCellsPerRow}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  gridCellsPerRow: parseInt(e.target.value),
                })
              }}
            />
          </div>

          <div>
            <label
              title="The height of each grid cell in pixels"
              style={labelStyle}
            >
              Grid cell height (px):
            </label>
          </div>
          <div>
            <input
              type="number"
              min={100}
              max={2500}
              value={settings.gridCellHeightPx}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  gridCellHeightPx: parseInt(e.target.value),
                })
              }}
            />
          </div>
          <div>
            <label
              title="Whether to enable scrolling to the next focusable element when pressing 'j' or 'k' in the results view."
              style={labelStyle}
            >
              Enable focus jump:
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              checked={settings.enableFocusJump}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  enableFocusJump: e.target.checked,
                })
              }}
            />
          </div>
          <div></div>
          <div>
            <button
              style={{
                float: 'right',
                margin: '4px',
              }}
              onClick={() => {
                handleSaveAndApply(settings)
              }}
            >
              Save
            </button>
            <button
              style={{
                float: 'right',
                margin: '4px',
              }}
              onClick={() => setSettings({ ...defaultGlobalSettings })}
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
