'use client';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode, useMemo } from 'react';

const themeOptions = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#2563eb', // Energetic Blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#f97316', // Vibrant Orange
    },
    background: {
      default: '#f8fafc', // Fallback
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: 'var(--font-absans), "Inter", "Outfit", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' as const },
    h2: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.5rem', fontWeight: 800 },
    button: { textTransform: 'uppercase' as const, fontWeight: 800, letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 8, // md (medium)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // md
          padding: '12px 28px',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#000000',
            color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined' as const,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#fcfcfc',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
            },
          },
        },
      },
    },
  },
};

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createTheme(themeOptions), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
