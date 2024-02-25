import { AttributeMap, DataHeader, DataHeaders } from './query-results'

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

  private evaluateInferredType(value: string) {
    if (value === 'true' || value === 'false') {
      return 'boolean'
    }
    if (parseInt(value)) {
      return 'number'
    }
    if (Date.parse(value)) {
      return 'date'
    }
    try {
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
