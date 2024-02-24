import { useEffect, useState } from 'react'
import { QueryResults } from './query-results'

export function useWebSocket() {
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  function initWebSocket() {
    if (window.WebSocket === undefined) {
      console.error('WebSocket is not supported')
    }
    if (socket !== null) {
      console.log('WebSocket is already initialized')
      return
    }
    //TOOO dynamically set the URL
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
      setQueryResults(JSON.parse(e.data))
    }
    socket.onerror = function (e) {
      console.error('WebSocket Error: ', e)
    }
    socket.onclose = function () {
      console.log('WebSocket is closed')
      setSocket(null)
      setTimeout(() => {
        initWebSocket()
      }, 5000)
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
