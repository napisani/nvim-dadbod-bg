import { RefObject, useCallback, useEffect } from 'react'
import { useGlobalSettings } from './useGlobalSettings'

export function useScrollTo({
  ref,
  focused,
}: {
  ref: RefObject<HTMLDivElement>
  focused: boolean
}) {
  const { globalSettings } = useGlobalSettings()
  const scrollTo = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (!ref.current) {
      return
    }
    const yOffset = -100
    const y =
      ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset

    ref.current.focus()
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [ref.current])

  useEffect(() => {
    if (focused && globalSettings.enableFocusJump) {
      scrollTo()
    }
  }, [focused, scrollTo])
}
