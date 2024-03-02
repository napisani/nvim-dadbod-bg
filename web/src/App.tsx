import './App.css'
import { GlobalSettings } from './GlobalSettings'
import { Results } from './Results'
import { FocusProvider } from './useFocusState'
import { GlobalSettingProvider } from './useGlobalSettings'
import { useApi } from './useApi'
import { useState } from 'react'
type Modes = 'GLOBAL_SETTINGS' | 'RESULTS'
function App() {
  const { queryResults, webSocketStatus } = useApi()
  const [mode, setMode] = useState<Modes>('RESULTS')

  return (
    <>
      <GlobalSettingProvider>
        <button
          style={{
            float: 'right',
            fontSize: 20,
            background: 'none',
            border: 'none',
          }}
          onClick={() => {
            setMode((prev) =>
              prev === 'GLOBAL_SETTINGS' ? 'RESULTS' : 'GLOBAL_SETTINGS'
            )
          }}
        >
          ⚙️
        </button>
        <div>
          {mode === 'GLOBAL_SETTINGS' && <GlobalSettings />}
          {(mode === 'RESULTS' || mode === 'GLOBAL_SETTINGS') && (
            <FocusProvider>
              <Results
                webSocketStatus={webSocketStatus}
                results={queryResults}
              />
            </FocusProvider>
          )}
        </div>
      </GlobalSettingProvider>
    </>
  )
}

export default App
