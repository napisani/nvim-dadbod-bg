import { useEffect, useState } from 'react'
import { QueryResults } from './query-results'

export function useWebSocket() {
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  function initWebSocket() {
    if (window.WebSocket === undefined) {
      console.log('WebSocket is not supported')
    }
    if (socket !== null) {
      console.log('WebSocket is already initialized')
      return
    }
    console.log('Connecting to the server........')
    setSocket(new WebSocket('ws://localhost:7777/ws'))
  }

  useEffect(() => {
    initWebSocket()
  })

  useEffect(() => {
    if (socket === null) {
      return
    }
    socket.onopen = function () {
      console.log('Connected to the server')
      if (queryResults === null) {
        console.log('Requesting query results')
        socket?.send(JSON.stringify({ action: 'QUERY_RESULTS' }))
      }
    }
    socket.onmessage = function (e) {
      console.log(e.data)
      console.log(JSON.parse(e.data))
      setQueryResults(JSON.parse(e.data))
      console.log('Received query results')
    }
    socket.onerror = function (e) {
      console.log('Error: ' + e)
    }
    socket.onclose = function () {
      console.log('Disconnected from the server')
      setSocket(null)
    }
  }, [socket, queryResults])

  async function requestQueryResults() {
    if (socket === null) {
      throw new Error('Socket is not initialized')
    }
  }

  return {
    initWebSocket,
    queryResults,
    requestQueryResults,
  }
}
