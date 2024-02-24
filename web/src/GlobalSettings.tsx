import { useState } from 'react'
import { jsonViewerThemes } from './json.util'
import { GloballyStoredSettings, useGlobalSettings } from './useGlobalSettings'
import { booleanOrNumberToString, stringToBooleanOrNumber } from './utils'

const labelStyle = {
  fontSize: 14,
}

export function GlobalSettings({ onSave }: { onSave: () => void }) {
  const { globalSettings, saveAndApplySettings } = useGlobalSettings()
  const [settings, setSettings] = useState<GloballyStoredSettings>({
    ...globalSettings,
  })

  const handleSaveAndApply = (settings: GloballyStoredSettings) => {
    saveAndApplySettings(settings)
    onSave()
  }

  return (
    <>
      <div>
        <h1>Global Settings</h1>
      </div>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content max-content',
            gap: 20,
          }}
        >
          <div>
            <label style={labelStyle}>JSON Viewer - default collapsed:</label>
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
            </select>
          </div>
          <div>
            <label style={labelStyle}>JSON Viewer - Theme:</label>
          </div>
          <div>
            <select
              value={settings.theme}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  theme: e.target.value,
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
            <label style={labelStyle}>Default apply filter:</label>
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
          <div></div>
          <div>
            <button
              style={{
                float: 'right',
              }}
              onClick={() => {
                handleSaveAndApply(settings)
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
