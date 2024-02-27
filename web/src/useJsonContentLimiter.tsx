import { useState, useCallback, useMemo } from 'react'

const LIMIT_TOKEN = '...[[TRUNKED]]...'
type ContentType = any

function keyPathToString(keyPath: any[]): string {
  return keyPath.join('.')
}

function containsLimitToken(content: string): boolean {
  return content.indexOf(LIMIT_TOKEN) > -1
}

function replaceLimitToken(content: string): string {
  return content.replace(LIMIT_TOKEN, '')
}

export function useJsonContentLimiter({
  defaultLimit,
  content,
}: {
  defaultLimit: number
  content: ContentType
}) {
  const [keyPathToLimit, setKeyPathToLimit] = useState<{
    [keyPath: string]: number
  }>({})

  const limitContent = useCallback(
    (keyPath: any[], content: ContentType): ContentType => {
      if (Array.isArray(content)) {
        const originalLength = content.length
        const limitLength = getLimit(keyPath)
        const limited: ContentType = content
          .slice(0, limitLength)
          .map((item, index) => {
            return limitContent([...keyPath, index], item)
          })
        if (originalLength > limitLength) {
          limited.push(`${LIMIT_TOKEN}${originalLength - limitLength} more`)
        }
        return limited
      }
      if (content === Object(content)) {
        const limitLength = getLimit(keyPath)
        const keys = Object.keys(content)
        const originalLength = keys.length
        const limited = keys
          .slice(0, limitLength)
          .reduce((acc: ContentType, key: string) => {
            acc[key] = limitContent([...keyPath, key], content[key])
            return acc
          }, {} as ContentType)
        if (originalLength > limitLength) {
          limited[LIMIT_TOKEN] =
            `${LIMIT_TOKEN} ${originalLength - limitLength} more`
        }
        return limited
      }
      return content
    },
    [keyPathToLimit]
  )

  const getLimit = useCallback(
    (keyPath: any[]): number => {
      const keyPathString = keyPathToString(keyPath)
      const limit = keyPathToLimit[keyPathString] ?? defaultLimit
      return limit
    },
    [keyPathToLimit, defaultLimit]
  )

  const setLimitForKeyPath = useCallback(
    (keyPath: any[], limit: number) => {
      setKeyPathToLimit((prev) => {
        return {
          ...prev,
          [keyPathToString(keyPath)]: limit,
        }
      })
    },
    [setKeyPathToLimit]
  )

  const addToLimitForKeyPath = useCallback(
    (keyPath: any[], addition: number) => {
      setKeyPathToLimit((prev) => {
        const keyPathString = keyPathToString(keyPath)
        const limit = prev[keyPathString] ?? defaultLimit
        return {
          ...prev,
          [keyPathString]: limit + addition,
        }
      })
    },
    [setKeyPathToLimit]
  )

  const limitedContent = useMemo(
    () => limitContent([], content),
    [limitContent, content]
  )

  return {
    setLimitForKeyPath,
    limitedContent,
    containsLimitToken,
    replaceLimitToken,
    addToLimitForKeyPath,
  }
}
