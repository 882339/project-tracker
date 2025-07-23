import React from 'react'
import { useTheme } from '../context/themeContext'


const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
  <header className="header">
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  </header>
  )
}

export default Header 