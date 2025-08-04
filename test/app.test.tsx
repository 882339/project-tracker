// src/App.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App  from '../src/App' 

vi.mock('../src/utils/fetchApi', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { id: 1, name: 'Test Project', description: '', status: '', progress: 0 }
  ]),
  fetchMilestones: vi.fn().mockResolvedValue([
    { id: 1, name: 'M1', project_id: 1, due_date: '2025-12-01' }
  ])
}))

describe('App component', () => {
  it('renders Project Tracker title', async () => {
    render(<App />)
    expect(await screen.findByText('Project Tracker')).toBeInTheDocument()
  })
})