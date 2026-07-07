import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

// ─── Color Tokens ──────────────────────────────────────────────────────────
const baseTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
  h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
  h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 500 },
  button: { fontFamily: '"Poppins", sans-serif', fontWeight: 600, textTransform: 'none' },
  subtitle1: { fontFamily: '"Poppins", sans-serif' },
  subtitle2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  body1: { fontFamily: '"Inter", sans-serif', lineHeight: 1.7 },
  body2: { fontFamily: '"Inter", sans-serif', lineHeight: 1.6 },
};

const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f772d',
        dark: '#3d5c22',
        light: '#6b9840',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#31572c',
        contrastText: '#ffffff',
      },
      success: { main: '#4caf50', light: '#e8f5e9', dark: '#388e3c' },
      warning: { main: '#ed6c02', light: '#fff3e0' },
      error:   { main: '#d32f2f', light: '#fdecea' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper:   mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary:   mode === 'dark' ? '#f8fafc'  : '#0f172a',
        secondary: mode === 'dark' ? '#94a3b8'  : '#546e7a',
        disabled:  mode === 'dark' ? '#475569'  : '#9eb3bf',
      },
      divider: mode === 'dark' ? '#334155' : '#e0e7ef',
    },
    typography: baseTypography,
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(79,119,45,0.2)' },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #5c8a35 0%, #4f772d 100%)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(0,0,0,0.06)',
            border: `1px solid ${mode === 'dark' ? '#334155' : '#e0e7ef'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
              '& fieldset': { borderColor: mode === 'dark' ? '#334155' : '#e0e7ef' },
              '&:hover fieldset': { borderColor: '#4f772d' },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiAppBar: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  });

// ─── Provider ──────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('mega_pacific_admin_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mega_pacific_admin_theme', next);
      return next;
    });
  };

  const muiTheme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, muiTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(ThemeContext);
