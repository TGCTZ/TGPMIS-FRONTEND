/** Format numeric readings for display without changing stored certificate snapshots. */
const MEASUREMENT_FORMAT = new Intl.NumberFormat('en-TZ', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

export function formatCertificateMeasurement(
  value: string | null | undefined
): string | null {
  if (!value) return null

  return value.replace(
    /[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/g,
    (reading) => {
      const number = Number(reading)
      return Number.isFinite(number)
        ? MEASUREMENT_FORMAT.format(number)
        : reading
    }
  )
}
