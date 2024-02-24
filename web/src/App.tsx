import './App.css'
import { Results } from './Results'
import { useWebSocket } from './useWebSocket'

function App() {
  const { queryResults } = useWebSocket()

  return <>{queryResults && <Results results={queryResults} />}</>
}

export default App
