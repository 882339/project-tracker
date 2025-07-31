import { describe, expect, it } from 'vitest'
import { fetchData } from '../src/utils/fetchApi'

describe('fetchData', () => {
  it('should have select method', () => {
    expect(fetchData.select).toBeDefined()
  })

  it('should have insert method', () => {
    expect(fetchData.insert).toBeDefined()
  })

  it('should have update method', () => {
    expect(fetchData.update).toBeDefined()
  })

  it('should have remove method', () => {
    expect(fetchData.remove).toBeDefined()
  })
}) 