import Mark from 'mark.js'
import { useEffect, useMemo } from 'react'

export function useMarker({
  searchNodeRef,
  settings,
}: {
  searchNodeRef: React.RefObject<HTMLDivElement>
  settings: {
    filter: string
    applyFilter: boolean
  }
}) {
  const markInstance = useMemo(() => {
    if (!searchNodeRef.current) {
      return
    }
    return new Mark(searchNodeRef.current)
  }, [searchNodeRef.current])

  useEffect(() => {
    markInstance?.unmark({
      done: () => {
        if (!settings.filter) {
          return
        }
        if (settings.filter.trim() === '') {
          return
        }
        markInstance?.mark(settings.filter)
      },
    })
  }, [settings])
}
