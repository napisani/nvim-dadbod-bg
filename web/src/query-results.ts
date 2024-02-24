export interface QueryResults {
  type: string
  content: string
}

export interface SubQueryResults {
  prefix: string
  type: string
  content: string | object
}
