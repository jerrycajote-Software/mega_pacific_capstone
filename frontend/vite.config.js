import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { analyzeApplicationError } from './src/utils/errorSolutionAdvisor.js'

const FRONTEND_ROOT = path.dirname(fileURLToPath(import.meta.url))

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m'
}

// Safely read +/- 3 lines from a local frontend/src file so developers see exact line context in the Vite terminal
const readFrontendCodeContext = (sourceFile, radius = 3) => {
  if (!sourceFile) return null
  const cleaned = String(sourceFile).replace(/\s*\([^)]*\)\s*$/, '').trim().replace(/\\/g, '/')
  const match = cleaned.match(/(?:frontend\/)?(src\/[^:]+):(\d+)(?::(\d+))?/i)
  if (!match) return null

  const relPath = match[1]
  const targetLine = Number(match[2])
  const targetCol = match[3] ? Number(match[3]) : null
  if (!Number.isInteger(targetLine) || targetLine < 1) return null

  try {
    const absPath = path.resolve(FRONTEND_ROOT, relPath)
    if (!absPath.startsWith(FRONTEND_ROOT)) return null
    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) return null

    const allLines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/)
    if (targetLine > allLines.length) return null

    const startLine = Math.max(1, targetLine - radius)
    const endLine = Math.min(allLines.length, targetLine + radius)
    const lines = []
    for (let current = startLine; current <= endLine; current += 1) {
      lines.push({ lineNumber: current, content: allLines[current - 1], isTarget: current === targetLine })
    }
    return { relPath: `frontend/${relPath}`, targetLine, targetCol, lines }
  } catch {
    return null
  }
}

const printFrontendSnippetAndSolutions = ({ sourceFile, category, summary, possibleSolutions, includeCodeContext = true }) => {
  const snippet = includeCodeContext ? readFrontendCodeContext(sourceFile) : null
  if (snippet && snippet.lines.length > 0) {
    console.error(`${ANSI.yellow}  Code Context (${snippet.relPath}:${snippet.targetLine}):${ANSI.reset}`)
    for (const row of snippet.lines) {
      const lineNumStr = String(row.lineNumber).padStart(4, ' ')
      if (row.isTarget) {
        console.error(`${ANSI.red}${ANSI.bold}  >> ${lineNumStr} | ${row.content}${ANSI.reset}`)
        if (snippet.targetCol && snippet.targetCol > 0) {
          const caretOffset = ' '.repeat(Math.min(snippet.targetCol - 1, 120))
          console.error(`${ANSI.yellow}${ANSI.bold}          | ${caretOffset}^${ANSI.reset}`)
        }
      } else {
        console.error(`${ANSI.dim}     ${lineNumStr} | ${row.content}${ANSI.reset}`)
      }
    }
  }
  if (category) {
    console.error(`${ANSI.cyan}${ANSI.bold}  Category   :${ANSI.reset} ${ANSI.cyan}${category}${ANSI.reset}`)
  }
  if (summary) {
    console.error(`${ANSI.cyan}  Likely Fix :${ANSI.reset} ${summary}`)
  }
  if (Array.isArray(possibleSolutions) && possibleSolutions.length > 0) {
    console.error(`${ANSI.green}${ANSI.bold}  Possible Solutions:${ANSI.reset}`)
    possibleSolutions.forEach((step, idx) => {
      console.error(`${ANSI.green}    ${idx + 1}. ${step}${ANSI.reset}`)
    })
  }
}

// Print browser runtime crashes, API failures, and Vite compile/syntax errors with code context and possible solutions
const frontendTerminalTracePlugin = () => ({
  name: 'mega-pacific-frontend-terminal-trace',
  configureServer(server) {
    // Intercept Vite compile and syntax errors sent to the browser overlay so possible fixes appear in the terminal
    const originalWsSend = server.ws.send.bind(server.ws)
    server.ws.send = (...args) => {
      const [firstArg] = args
      if (firstArg && typeof firstArg === 'object' && firstArg.type === 'error' && firstArg.err) {
        const err = firstArg.err
        const rawFile = err.loc?.file || err.id || ''
        const normalizedFile = rawFile
          ? rawFile.replace(/\\/g, '/').replace(/^.*?(src\/)/i, 'frontend/$1')
          : null
        const sourceFile =
          normalizedFile && err.loc?.line
            ? `${normalizedFile}:${err.loc.line}${err.loc?.column ? `:${err.loc.column}` : ''}`
            : normalizedFile

        const diagnosis = analyzeApplicationError({
          source: 'frontend_compile',
          errorMessage: err.message || 'Vite compile error',
          stackTrace: err.stack || err.frame || '',
          sourceFile
        })

        console.error('')
        console.error(`${ANSI.bgRed}${ANSI.white}${ANSI.bold} FRONTEND COMPILE / SYNTAX DIAGNOSIS ${ANSI.reset}`)
        if (sourceFile) {
          console.error(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${sourceFile}${ANSI.reset}`)
        }
        console.error(`${ANSI.red}  Message    :${ANSI.reset} ${String(err.message || '').split('\n')[0]}`)
        printFrontendSnippetAndSolutions({
          sourceFile,
          category: diagnosis?.category,
          summary: diagnosis?.summary,
          possibleSolutions: diagnosis?.possibleSolutions
        })
        console.error('')
      }
      return originalWsSend(...args)
    }

    server.middlewares.use('/__client-log', (req, res, next) => {
      if (req.method !== 'POST') {
        return next()
      }

      let rawBody = ''
      req.on('data', (chunk) => {
        rawBody += chunk
        if (rawBody.length > 100000) {
          rawBody = rawBody.slice(0, 100000)
        }
      })

      req.on('end', () => {
        try {
          const payload = JSON.parse(rawBody || '{}')
          const timestamp = new Date().toLocaleString('en-PH', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })

          console.error('')
          console.error(
            `${ANSI.bgRed}${ANSI.white}${ANSI.bold} FRONTEND ERROR TRACE ${ANSI.reset} ${ANSI.gray}[${timestamp}]${ANSI.reset} ${ANSI.cyan}[${payload.traceId || 'FE-TRACE'}]${ANSI.reset}`
          )
          console.error(
            `${ANSI.red}  Portal     :${ANSI.reset} ${payload.portal || 'unknown'} | Role: ${payload.reporterRole || 'guest'}${payload.reporterEmail ? ` (${payload.reporterEmail})` : ''}`
          )
          console.error(`${ANSI.red}  Source     :${ANSI.reset} ${payload.source || 'frontend_runtime'}`)
          if (payload.sourceFile) {
            console.error(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${payload.sourceFile}${ANSI.reset}`)
          }
          if (Array.isArray(payload.sourceFiles) && payload.sourceFiles.length > 1) {
            console.error(`${ANSI.yellow}  Call Chain :${ANSI.reset} ${payload.sourceFiles.slice(1).join('  <-  ')}`)
          }
          console.error(`${ANSI.red}  Page URL   :${ANSI.reset} ${payload.pageUrl || 'unknown'}`)
          if (payload.apiEndpoint) {
            console.error(
              `${ANSI.red}  API Failed :${ANSI.reset} ${payload.apiEndpoint}${payload.httpStatus ? ` (HTTP ${payload.httpStatus})` : ''}`
            )
          }
          console.error(`${ANSI.red}  Message    :${ANSI.reset} ${payload.errorMessage || 'Unknown frontend error'}`)
          printFrontendSnippetAndSolutions({
            sourceFile: payload.sourceFile,
            category: payload.diagnosisCategory,
            summary: payload.diagnosisHint,
            possibleSolutions: payload.possibleSolutions,
            includeCodeContext: payload.source !== 'api_error'
          })
          if (payload.stackTrace) {
            console.error(`${ANSI.red}  Stack Trace:${ANSI.reset}`)
            String(payload.stackTrace)
              .split('\n')
              .slice(0, 10)
              .forEach((line) => console.error(`    ${ANSI.dim}${line}${ANSI.reset}`))
          }
          if (payload.componentStack) {
            console.error(`${ANSI.red}  React Tree :${ANSI.reset}`)
            String(payload.componentStack)
              .split('\n')
              .filter(Boolean)
              .slice(0, 6)
              .forEach((line) => console.error(`    ${ANSI.dim}${line.trim()}${ANSI.reset}`))
          }
          console.error('')
        } catch {
          console.error(`${ANSI.red}[FRONTEND TRACE] Failed to parse client error payload.${ANSI.reset}`)
        }

        res.statusCode = 204
        res.end()
      })
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), frontendTerminalTracePlugin()],
  server: {
    host: true,
    allowedHosts: true, // Required for ngrok
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Points to local Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
