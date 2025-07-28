import React from 'react'
import { useTheme } from '../context/themeContext'


const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="p-4 flex justify-end bg-background">
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="px-3 py-2 rounded bg-muted text-foreground hover:bg-primary transition"
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  )
}

export default Header 