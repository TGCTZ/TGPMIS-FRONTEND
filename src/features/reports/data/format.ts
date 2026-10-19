import { formatMoney } from '@/lib/format'

/** Keep the numeric amount when the report already identifies TZS separately. */
export function formatReportMoney(
  amount: number | null | undefined,
  currency: string
) {
  const formatted = formatMoney(amount, currency)
  return currency.toUpperCase() === 'TZS'
    ? formatted.replace(/^TSh[\s\u00a0]*/i, '')
    : formatted
}

/** Put the currency code before the amount instead of using the local symbol. */
export function formatReportBadgeMoney(
  amount: number | null | undefined,
  currency: string
) {
  const formatted = formatReportMoney(amount, currency)
  return currency.toUpperCase() === 'TZS' ? `TZS ${formatted}` : formatted
}
