import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as AdminThemeProvider } from './context/ThemeContext'
import App from './App.jsx'
import './i18n'
import './index.css'
import CssBaseline from '@mui/material/CssBaseline'

// AdminThemeProvider handles its own MUI ThemeProvider internally per route.
// Customer side uses static light theme; admin side uses dynamic dark/light toggle.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </AdminThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
