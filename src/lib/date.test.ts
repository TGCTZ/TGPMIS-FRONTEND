import { describe, expect, it } from 'vitest'
import { formatDateInput, isIsoDate, parseDateInput } from './date'

describe('UI date conversion', () => {
  it('formats ISO dates as dd/mm/yyyy', () => {
    expect(formatDateInput('2026-10-30')).toBe('30/10/2026')
  })

  it('parses valid dd/mm/yyyy dates to ISO', () => {
    expect(parseDateInput('30/10/2026')).toBe('2026-10-30')
    expect(parseDateInput('29/02/2024')).toBe('2024-02-29')
  })

  it('rejects incomplete and impossible dates', () => {
    expect(parseDateInput('3/10/2026')).toBeNull()
    expect(parseDateInput('31/04/2026')).toBeNull()
    expect(parseDateInput('29/02/2025')).toBeNull()
    expect(isIsoDate('2026-13-01')).toBe(false)
  })
})
