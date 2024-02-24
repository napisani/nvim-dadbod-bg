import { QueryResults } from './query-results'
import { lightTheme } from '@uiw/react-json-view/light'
import { darkTheme } from '@uiw/react-json-view/dark'
import { nordTheme } from '@uiw/react-json-view/nord'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { vscodeTheme } from '@uiw/react-json-view/vscode'
import { gruvboxTheme } from '@uiw/react-json-view/gruvbox'
import { monokaiTheme } from '@uiw/react-json-view/monokai'
import { basicTheme } from '@uiw/react-json-view/basic'

export const newlineRegex = /(\r|\n|\r\n)/g

export function parseJsonSections(results: QueryResults) {
  // any string that starts with a newline or is the first content of the first line
  // and is not enclosed in curly braces
  // and ends with a > character
  const re = /(^|\r|\n|\r\n)(?![^{}]*})(.*>)/g
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
  return contentSections
}

export const jsonViewerThemes: {
  [key: string]: any
} = {
  lightTheme,
  darkTheme,
  nordTheme,
  githubLightTheme,
  githubDarkTheme,
  vscodeTheme,
  gruvboxTheme,
  monokaiTheme,
  basicTheme,
}