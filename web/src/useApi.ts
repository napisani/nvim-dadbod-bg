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
  const [webSocketStatus, setWebSocketStatus] = useState<
    'connected' | 'disconnected'
  >('disconnected')

  async function initWebSocket(force = false) {
    if (window.WebSocket === undefined) {
      console.error('WebSocket is not supported')
    }
    if (socket !== null) {
      if (force) {
        console.log('WebSocket is already initialized, closing')
      } else {
        console.log('WebSocket is already initialized')
        return
      }
    }

    console.log('Connecting to WebSocket', wsURL)
    const s = new WebSocket(wsURL)
    setSocket(s)
  }

  useEffect(() => {
    initWebSocket()
  }, [])

  useEffect(() => {
    if (socket === null) {
      return
    }
    socket.onopen = async function () {
      console.log('Connected to the server')
      if (queryResults === null) {
        const results = await requestTypedQueryResults()
        setQueryResults(results)
      }
      setWebSocketStatus('connected')
    }
    socket.onmessage = async function () {
      const results = await requestTypedQueryResults()
      setQueryResults(results)
    }
    socket.onerror = function (e) {
      console.error('WebSocket error', e)
      if (socket !== null) {
        socket.close()
        return
      }
      setWebSocketStatus('disconnected')
    }
    socket.onclose = function () {
      console.log('WebSocket is closed')
      setWebSocketStatus('disconnected')
      initWebSocket(true)
    }
  }, [socket, queryResults])

  async function requestTypedQueryResults(): Promise<TypedQueryResults> {
    const response = await fetch(`${apiURL}/typed-query-results`)
    const data = await response.json()
    return {
      ...data,
      receivedAt: Math.round(new Date().getTime() / 1000),
    }
  }
  async function requestRawQueryResults(): Promise<RawQueryResults> {
    const response = await fetch(`${apiURL}/raw-query-results`)
    const data = await response.json()
    return {
      ...data,
      receivedAt: Math.round(new Date().getTime() / 1000),
    }
  }

  return {
    initWebSocket,
    queryResults,
    requestTypedQueryResults,
    requestRawQueryResults,
    webSocketStatus,
  }
}
