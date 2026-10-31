/** Return true for a real calendar date in the API's YYYY-MM-DD format. */
export function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  )
}

/** Display a valid ISO date in the UI's dd/mm/yyyy format. */
export function formatDateInput(value: string): string {
  if (!isIsoDate(value)) return value
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

/** Convert a complete dd/mm/yyyy entry to the ISO date used by the API. */
export function parseDateInput(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null

  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  return isIsoDate(iso) ? iso : null
}
