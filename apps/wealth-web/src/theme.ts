import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#124c63',
      dark: '#0a3345',
    },
    secondary: {
      main: '#5b6f2a',
    },
    success: {
      main: '#247a4d',
    },
    warning: {
      main: '#a66a00',
    },
    error: {
      main: '#b23b3b',
    },
    background: {
      default: '#f5f7f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#14252f',
      secondary: '#5b6870',
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '1.55rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h2: {
      fontSize: '1.2rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 8,
  },
});
