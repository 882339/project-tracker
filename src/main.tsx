import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/themeContext.tsx'
import Header from './component/header.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Header />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
