import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as AdminThemeProvider } from './context/ThemeContext'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { initializeFrontendErrorMonitor } from './utils/errorMonitor'
import './i18n'
import './index.css'
import CssBaseline from '@mui/material/CssBaseline'

initializeFrontendErrorMonitor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminThemeProvider>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </AdminThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
