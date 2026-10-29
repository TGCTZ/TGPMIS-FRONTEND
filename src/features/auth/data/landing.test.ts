import { describe, expect, it } from 'vitest'
import { landingPath } from './landing'

describe('login landing page', () => {
  it('sends every role to Highlights regardless of report permissions', () => {
    expect(landingPath()).toBe('/reports/highlights')
  })
})
