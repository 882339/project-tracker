// src/App.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App  from '../src/App' 

describe('App component', () => {
  it('renders Project Tracker title', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Project Tracker')).toBeInTheDocument()
    })
  })
})
