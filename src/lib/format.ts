/**
 * App-wide formatting.
 *
 * Every money, date and number in the UI goes through here. Without it each
 * call site falls back to the *viewer's* browser locale, so the same record
 * reads differently on two machines — `1,999.00` in Dar es Salaam and
 * `1.999,00` on a German laptop. Pinning the locale makes the app's output a
 * property of the app, not of whoever opened it.
 *
 * Swap point: change the three constants below to relocate the app.
 */

const APP_LOCALE = 'en-TZ'
const APP_TIMEZONE = 'Africa/Dar_es_Salaam'
/**
 * The single currency the app deals in.
 *
 * The API retains a currency field for gateway and report compatibility, but
 * billing and payment records are restricted to TZS.
 */
const DEFAULT_CURRENCY = 'TZS'

/**
 * Format a monetary value.
 *
 * The optional currency argument keeps existing call sites compatible; API
 * response schemas require TZS for monetary records.
 */
export function formatMoney(
  value: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined) return '—'

  try {
    return new Intl.NumberFormat(APP_LOCALE, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(maximumFractionDigits)}`
  }
}

/** Date only, e.g. 04/09/2026. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'

  return new Date(value).toLocaleDateString(APP_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  })
}

/** Date and time, e.g. 04/09/2026, 08:26:22. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'

  return new Date(value).toLocaleString(APP_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  })
}

/** Time only — paired with formatDate in tight table cells. */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '—'

  return new Date(value).toLocaleTimeString(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
  })
}
