import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, useTheme } from './context/themeContext.tsx'
import Header from './components/header.tsx'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material'
import type { PaletteMode } from '@mui/material'
import './index.css'
import App from './App.tsx'


const getMuiTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#121212' : '#f9fafb',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      primary: {
        main: '#3b82f6',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#111827',
        secondary: mode === 'dark' ? '#e0e0e0' : '#6b7280',
      },
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
    },
  })

/** 🎯 Wrapper che sincronizza il context col tema MUI */
const WithMuiTheme = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme()
  const muiTheme = getMuiTheme(theme)
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider >
      <WithMuiTheme>
        <Header />
        <App />
      </WithMuiTheme>
    </ThemeProvider >
  </StrictMode>
)
