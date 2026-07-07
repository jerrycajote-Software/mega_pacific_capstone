import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
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
    success: {
      main: '#4caf50',
      light: '#e8f5e9',
      dark: '#388e3c',
    },
    warning: {
      main: '#ed6c02',
      light: '#fff3e0',
    },
    error: {
      main: '#d32f2f',
      light: '#fdecea',
    },
    background: {
      default: '#f5f7fa',   // clean neutral light — replaces yellow-green #ecf39e
      paper:   '#ffffff',
    },
    text: {
      primary:   '#1a2027',  // near-black for strong readability
      secondary: '#546e7a',  // neutral blue-grey for secondary copy
      disabled:  '#9eb3bf',
    },
    divider: '#e0e7ef',      // subtle neutral grey divider
    grey: {
      50:  '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 500 },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
    subtitle1: { fontFamily: '"Poppins", sans-serif' },
    subtitle2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    body1:     { fontFamily: '"Inter", sans-serif', lineHeight: 1.7 },
    body2:     { fontFamily: '"Inter", sans-serif', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 119, 45, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5c8a35 0%, #4f772d 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e0e7ef',   // neutral grey border (replaces yellow-green)
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e0e7ef' },
            '&:hover fieldset': { borderColor: '#4f772d' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
