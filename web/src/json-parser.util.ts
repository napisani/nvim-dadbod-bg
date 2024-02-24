import { QueryResults } from './query-results'

export function parseJsonSections(results: QueryResults) {
  const re = /(^|\r|\n|\r\n)(.*>)/g
  console.log('content', results.content)
  const contentSections = results.content
    .split(re)
    .reverse()
    .reduce(
      (acc, line) => {
        if (line.match(re)) {
          const withoutNewline = line.replace(/(\r|\n|\r\n)/g, '')
          const lastSectionFixed = {
            line: acc[acc.length - 1].line,
            prefix: withoutNewline,
          }
          const accWithoutLast = acc.slice(0, acc.length - 1)
          accWithoutLast.push(lastSectionFixed)
          return accWithoutLast
        } else {
          acc.push({
            prefix: '',
            line,
          })
        }
        return acc
      },
      [] as { prefix: string; line: string }[]
    )
    .reverse()
    .filter((section) => section.line.trim() !== '')
    .map((section) => {
      try {
        const content = JSON.parse(section.line)
        return {
          prefix: section.prefix,
          type: 'json',
          content,
        }
      } catch (e) {
        return {
          type: 'text',
          content: section.line,
          prefix: section.prefix,
        }
      }
    })
  console.log('contentSections', contentSections)
  return contentSections
}
