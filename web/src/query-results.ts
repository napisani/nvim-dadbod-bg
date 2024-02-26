export interface QueryResults {
  type: string
  content: string
}

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'object'

export type AttributeMap = Record<string, any>

export type DataHeader = {
  name: string
  inferredType?: DataType
}

export type DataHeaders = DataHeader[]

export interface SubQueryResults {
  prefix: string
  type: string
  content: string | AttributeMap[]
  header?: DataHeaders
}
