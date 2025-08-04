// src/App.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App' 

vi.mock('./utils/fetchApi', () => ({
  fetchData: {
    select: vi.fn().mockResolvedValue([])  // restituisce array vuoto (oppure dati finti)
  }
}))

describe('App component', () => {
  it('renders Project Tracker title', async () => {
    render(<App />)
    expect(await screen.findByText('Project Tracker')).toBeInTheDocument()
  })
}) 