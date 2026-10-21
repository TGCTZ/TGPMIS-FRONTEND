import { describe, expect, it } from 'vitest'
import { formatCertificateMeasurement } from './format'

describe('formatCertificateMeasurement', () => {
  it('shows whole and fractional readings with two decimal places', () => {
    expect(formatCertificateMeasurement('2')).toBe('2.00')
    expect(formatCertificateMeasurement('2.5')).toBe('2.50')
    expect(formatCertificateMeasurement('2.500')).toBe('2.50')
    expect(formatCertificateMeasurement('2.675')).toBe('2.68')
  })

  it('formats numeric endpoints and preserves range notation', () => {
    expect(formatCertificateMeasurement('2.650 – 3.5')).toBe('2.65 – 3.50')
  })

  it('preserves nonnumeric labels and treats blank readings as absent', () => {
    expect(formatCertificateMeasurement('not recorded')).toBe('not recorded')
    expect(formatCertificateMeasurement('')).toBeNull()
    expect(formatCertificateMeasurement(null)).toBeNull()
  })
})
