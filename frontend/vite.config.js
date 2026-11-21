import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m'
}

// Print browser runtime crashes and API failures directly inside the frontend Vite terminal
const frontendTerminalTracePlugin = () => ({
  name: 'mega-pacific-frontend-terminal-trace',
  configureServer(server) {
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
          if (payload.diagnosisHint) {
            console.error(`${ANSI.cyan}  Likely Fix :${ANSI.reset} ${payload.diagnosisHint}`)
          }
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
