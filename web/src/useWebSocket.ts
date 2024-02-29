import { useEffect, useState } from 'react'
import { RawQueryResults, TypedQueryResults } from './query-results'

const apiURL =
  import.meta.env.MODE === 'development'
    ? `http://localhost:4546`
    : `http://${window.location.host}`
const wsURL =
  import.meta.env.MODE === 'development'
    ? `ws://localhost:4546/ws`
    : `ws://${window.location.host}/ws`

export function useApi() {
  const [queryResults, setQueryResults] = useState<TypedQueryResults | null>(
    null
  )
  const [socket, setSocket] = useState<WebSocket | null>(null)

  function initWebSocket() {
    if (window.WebSocket === undefined) {
      console.error('WebSocket is not supported')
    }
    if (socket !== null) {
      console.log('WebSocket is already initialized')
      return
    }

    console.log('Connecting to WebSocket', wsURL)
    setSocket(new WebSocket(wsURL))
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
    socket.onmessage = async function () {
      const results = await requestTypedQueryResults()
      setQueryResults(results)
      // setQueryResults(JSON.parse(e.data))
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

  async function requestTypedQueryResults(): Promise<TypedQueryResults> {
    const response = await fetch(`${apiURL}/typed-query-results`)
    const data = await response.json()
    console.log('Typed query results:', data)
    return data
  }
  async function requestRawQueryResults(): Promise<RawQueryResults> {
    const response = await fetch(`${apiURL}/raw-query-results`)
    const data = await response.json()
    return data
  }

  return {
    initWebSocket,
    queryResults,
    requestTypedQueryResults,
    requestRawQueryResults,
  }
}
