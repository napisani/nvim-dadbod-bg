import {
  AttributeMap,
  DataHeader,
  DataHeaders,
  DataType,
} from './query-results'

export const newlineRegex = /(\r|\n|\r\n)/g

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: any
  return function (this: any, ...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  } as any
}

export function stringToBooleanOrNumber(value: string) {
  if (value === 'true' || value === 'false') {
    return value === 'true'
  }
  return parseInt(value)
}

export function booleanOrNumberToString(value: number | boolean) {
  return `${value}`
}

export class HeaderAccumulator {
  private headers: { [key: string]: DataHeader } = {}
  private inferTypes: boolean
  private isStatic = false

  constructor({
    inferTypes,
    staticHeaders,
  }: {
    inferTypes: boolean
    staticHeaders?: string[]
  }) {
    if (staticHeaders) {
      this.isStatic = true
      for (const header of staticHeaders) {
        this.addHeader(header)
      }
    }
    this.inferTypes = inferTypes
  }

  inspectRow(row: AttributeMap) {
    if (this.isStatic && !this.inferTypes) {
      return
    }
    for (const key in row) {
      if (!this.isStatic) {
        this.addHeader(key)
      }
      if (this.inferTypes) {
        const newType = this.reevaluateInferredType(row[key], this.headers[key])
        this.headers[key].inferredType = newType
      }
    }
  }

  private evaluateInferredType(value: any) {
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      return 'boolean'
    }
    if (typeof value === 'number' || parseFloat(value)) {
      return 'number'
    }
    if (value instanceof Date || Date.parse(value)) {
      return 'date'
    }
    try {
      if (typeof value === 'object') {
        return 'object'
      }
      JSON.parse(value)
      return 'object'
    } catch (e) {
      return 'string'
    }
  }

  private reevaluateInferredType(value: string, header: DataHeader) {
    const currentType = header.inferredType
    const newType = this.evaluateInferredType(value)
    if (!currentType) {
      return newType
    }
    if (currentType === newType) {
      return currentType
    }
    return 'string'
  }

  private addHeader(name: string) {
    if (!this.headers[name]) {
      this.headers[name] = {
        name,
      }
    }
  }

  toDataHeaders(): DataHeaders {
    return Object.values(this.headers)
  }
}

export function isDarkModeDefault() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function parseByInferredType(value: any, inferredType: DataType) {
  switch (inferredType) {
    case 'number':
      if (typeof value === 'number') {
        return value
      }
      return parseFloat(value)
    case 'boolean':
      if (typeof value === 'boolean') {
        return value
      }
      return value === 'true'
    case 'date':
      if (value instanceof Date) {
        return value
      }
      return new Date(value)
    case 'object':
      if (typeof value === 'object') {
        return value
      }
      try {
        return JSON.parse(value)
      } catch (e) {
        return value?.toString()
      }
  }
  return value ? value?.toString() : value
}

export function trimQuotes(value: string) {
  return value.replace(/^"/, '').replace(/"$/, '')
}

export function timeDifferenceNow(previous: number) {
  return timeDifference(new Date().getTime(), previous)
}
export function timeDifference(current: number, previous: number) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current - previous

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago'
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago'
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago'
  }
}
