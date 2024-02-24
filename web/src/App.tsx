import './App.css'
import { GlobalSettings } from './GlobalSettings'
import { Results } from './Results'
import { FocusProvider } from './useFocusState'
import { GlobalSettingProvider } from './useGlobalSettings'
import { useWebSocket } from './useWebSocket'
import { useState } from 'react'
type Modes = 'GLOBAL_SETTINGS' | 'RESULTS'
function App() {
  const { queryResults } = useWebSocket()
  const [mode, setMode] = useState<Modes>('RESULTS')

  return (
    <>
      <GlobalSettingProvider>
        <button
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
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
          {mode === 'GLOBAL_SETTINGS' && (
            <GlobalSettings
              onSave={() => {
                setMode('RESULTS')
              }}
            />
          )}
          {mode === 'RESULTS' && (
            <FocusProvider>
              {queryResults && <Results results={queryResults} />}
            </FocusProvider>
          )}
        </div>
      </GlobalSettingProvider>
    </>
  )
}

export default App
