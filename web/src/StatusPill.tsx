import { useEffect, useState } from 'react'
import { timeDifferenceNow } from './utils'

export function StatusPill({
  parsedAt,
  receivedAt,

  webSocketStatus,
}: {
  parsedAt?: number
  receivedAt?: number
  webSocketStatus: string
}) {
  const [renderKey, setRenderKey] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderKey((prev) => prev + 1)
    }, 5000)
    return () => clearInterval(interval)
  })
  const receivedAtTime =
    receivedAt != null ? timeDifferenceNow(receivedAt * 1000) : ' never '
  const parsedAtTime =
    parsedAt != null ? timeDifferenceNow(parsedAt * 1000) : ' never '

  return (
    <>
      <span
        key={renderKey}
        className="updated-pill"
        title={`parsed: ${parsedAtTime}\nreceived: ${receivedAtTime}`}
      >
        {receivedAtTime}
        {webSocketStatus === 'connected' ? (
          <span
            style={{ marginLeft: 10 }}
            className="socket-connected"
            title="connected to dadbod bg server"
          ></span>
        ) : (
          <span
            style={{ marginLeft: 10 }}
            className="socket-disconnected"
            title="disconnected from dadbod bg server"
          ></span>
        )}
      </span>
    </>
  )
}
