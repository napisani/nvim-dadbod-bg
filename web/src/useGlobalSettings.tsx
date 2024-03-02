import { createContext, useCallback, useContext, useState } from 'react'
import { isDarkModeDefault } from './utils'

export interface GlobalSettingContextProps {
  globalSettings: GloballyStoredSettings
  saveAndApplySettings: (settings: GloballyStoredSettings) => void
}

export interface GloballyStoredSettings {
  collapsed: number | boolean
  applyFilter: boolean
  jsonTheme: string
  tableTheme: string
  showMoreAmount: number
  gridCellsPerRow: number
  gridCellHeightPx: number
}

const storageKey = 'GLOBAL_SETTINGS'

export const defaultGlobalSettings: GloballyStoredSettings = {
  collapsed: 2,
  showMoreAmount: 25,
  applyFilter: true,
  gridCellsPerRow: 1,
  gridCellHeightPx: 400,
  jsonTheme: 'twilight',
  tableTheme: isDarkModeDefault()
    ? 'ag-theme-alpine-auto-dark'
    : 'ag-theme-alpine-auto',
}

const GlobalSettingContext = createContext<GlobalSettingContextProps>({
  globalSettings: {
    ...defaultGlobalSettings,
  },
  saveAndApplySettings: () => {},
})

export const GlobalSettingProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [globalSettings, setGlobalSettings] = useState<GloballyStoredSettings>({
    ...defaultGlobalSettings,
    ...(localStorage.getItem(storageKey) &&
      JSON.parse(localStorage.getItem(storageKey) as string)),
  })

  const saveAndApplySettings = useCallback(
    (settings: GloballyStoredSettings) => {
      setGlobalSettings(settings)
      localStorage.setItem(storageKey, JSON.stringify(settings))
    },
    [setGlobalSettings]
  )

  return (
    <GlobalSettingContext.Provider
      value={{
        globalSettings,
        saveAndApplySettings,
      }}
    >
      {children}
    </GlobalSettingContext.Provider>
  )
}

export const useGlobalSettings = () => {
  const { globalSettings, saveAndApplySettings } =
    useContext(GlobalSettingContext)

  return {
    globalSettings,
    saveAndApplySettings,
  }
}
