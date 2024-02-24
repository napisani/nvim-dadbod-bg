import { createContext, useCallback, useContext, useState } from 'react'

export interface GlobalSettingContextProps {
  globalSettings: GloballyStoredSettings
  saveAndApplySettings: (settings: GloballyStoredSettings) => void
}

export interface GloballyStoredSettings {
  collapsed: number | boolean
  applyFilter: boolean
  theme: string
}

const storageKey = 'GLOBAL_SETTINGS'

const GlobalSettingContext = createContext<GlobalSettingContextProps>({
  globalSettings: {
    collapsed: 2,
    applyFilter: true,
    theme: 'basicTheme',
  },
  saveAndApplySettings: () => {},
})

export const GlobalSettingProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [globalSettings, setGlobalSettings] = useState<GloballyStoredSettings>({
    collapsed: 2,
    applyFilter: true,
    theme: 'basicTheme',
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
