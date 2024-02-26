import { AttributeMap, QueryResults, SubQueryResults } from './query-results'
import { HeaderAccumulator } from './utils'

// eslint-disable-next-line no-useless-escape
const newlineRegex = /[\||\+][\r|\n|\r\n]/g
export function parseDBOutSections(results: QueryResults): SubQueryResults[] {
  const lines = results.content.split(newlineRegex)
  const sections = []
  let currentSection = []
  let dividerRowCounter = 0
  for (const line of lines) {
    if (line.split('').every((char) => char === '+' || char === '-')) {
      dividerRowCounter += 1
      if (dividerRowCounter === 3) {
        sections.push([...currentSection])
        currentSection = []
        dividerRowCounter = 0
      }
    } else if (line.indexOf('|') > -1) {
      currentSection.push(line)
    } else {
      console.warn('ignoring line - (not in dbout format):', line)
    }
  }
  if (currentSection.length > 0) {
    sections.push(currentSection)
  }

  const result = sections.map((section) => {
    const lines = section
      .map((line) => line.replace(/^\|\s*/g, ''))
      .map((line) => line.replace(/\s*\|$/g, ''))
      .filter((line) => line.trim() !== '')
      .map((line) => line.split(/\s+\|\s+/g).map((cell) => cell.trim()))
    const [header, ...rows] = lines
    const headerAcc = new HeaderAccumulator({
      inferTypes: true,
      staticHeaders: header,
    })

    const rowsWithCols = rows.map((row) => {
      const rowWithColKeys = header.reduce((acc, columnName, index) => {
        acc[columnName] = row[index]
        return acc
      }, {} as AttributeMap)
      headerAcc.inspectRow(rowWithColKeys)
      return rowWithColKeys
    })

    return {
      type: 'dbout',
      content: rowsWithCols,
      //   // the dbout format does not seem to have prefixes
      prefix: '',
      header: headerAcc.toDataHeaders(),
    }
  })
  return result
}

export const tableThemes = [
  'ag-theme-quartz',
  'ag-theme-quartz-auto',
  'ag-theme-quartz-dark',
  'ag-theme-quartz-auto-dark',
  'ag-theme-alpine',
  'ag-theme-alpine-auto',
  'ag-theme-alpine-dark',
  'ag-theme-alpine-auto-dark',
  'ag-theme-balham',
  'ag-theme-balham-auto',
  'ag-theme-balham-dark',
  'ag-theme-balham-auto-dark',
  'ag-theme-material',
]
