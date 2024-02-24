import './App.css'
import { Results } from './Results'
import { FocusProvider } from './useFocusState'
import { useWebSocket } from './useWebSocket'

function App() {
  const { queryResults } = useWebSocket()

  return (
    <>
      <FocusProvider>
        {queryResults && <Results results={queryResults} />}
      </FocusProvider>
    </>
  )
}

export default App
