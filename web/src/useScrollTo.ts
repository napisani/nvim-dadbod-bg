import { RefObject, useCallback, useEffect } from 'react'

export function useScrollTo({
  ref,
  focused,
}: {
  ref: RefObject<HTMLDivElement>
  focused: boolean
}) {

  const scrollTo = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [ref.current])

  useEffect(() => {
    if (focused) {
      scrollTo()
    }
  }, [focused, scrollTo])
}
