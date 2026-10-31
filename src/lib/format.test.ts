import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from './format'

describe('date display format', () => {
  it('pins date-only values to dd/mm/yyyy', () => {
    expect(formatDate('2026-10-30')).toBe('30/10/2026')
  })

  it('uses dd/mm/yyyy at the start of date-time values', () => {
    expect(formatDateTime('2026-10-30T09:15:00+03:00')).toMatch(
      /^30\/10\/2026\b/
    )
  })
})
