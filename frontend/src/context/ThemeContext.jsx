import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

const getTypography = () => {
  const bodyFont = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const headingFont = '"Montserrat", "Poppins", sans-serif';
  
  return {
    fontFamily: bodyFont,
    h1: { fontFamily: headingFont, fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontFamily: headingFont, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: headingFont, fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontFamily: headingFont, fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: headingFont, fontWeight: 600 },
    h6: { fontFamily: headingFont, fontWeight: 600 },
    button: { fontFamily: headingFont, fontWeight: 600, textTransform: 'none' },
    subtitle1: { fontFamily: headingFont, fontWeight: 600 },
    subtitle2: { fontFamily: headingFont, fontWeight: 600 },
    body1: { fontFamily: bodyFont, lineHeight: 1.65 },
    body2: { fontFamily: bodyFont, lineHeight: 1.6 },
    caption: { fontFamily: bodyFont },
    overline: { fontFamily: headingFont, fontWeight: 700, letterSpacing: '0.1em' },
  };
};

const buildTheme = (mode, isCustomerRoute) =>
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
    typography: getTypography(isCustomerRoute),
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

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  const staffPortals = [
    '/admin', '/sales', '/finance', '/logistic', '/owner', '/superadmin',
    '/admin-1megapacific', '/sales-1megapacific', '/finance-1megapacific',
    '/logistic-1megapacific', '/owner-1megapacific', '/superadmin-0megapacific'
  ];
  const isCustomerRoute = !staffPortals.some((portal) => location.pathname.startsWith(portal));

  const [storedMode, setStoredMode] = useState(() => {
    return localStorage.getItem('mega_pacific_admin_theme') || 'dark';
  });

  const mode = isCustomerRoute ? 'light' : storedMode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setStoredMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mega_pacific_admin_theme', next);
      return next;
    });
  };

  const muiTheme = useMemo(() => buildTheme(mode, isCustomerRoute), [mode, isCustomerRoute]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, muiTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(ThemeContext);
