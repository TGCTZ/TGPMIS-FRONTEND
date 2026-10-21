import { formatMoney } from '@/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { brandPanelClassName } from '@/components/layout/brand-panel'
import { type ReportKind } from '../data/config'
import { formatReportBadgeMoney } from '../data/format'
import { type ReportSection } from '../data/schema'

/** The shared cards show full-result totals, independent of detail pagination. */
export function SummaryCards({
  kind,
  sections,
}: {
  kind: ReportKind
  sections: ReportSection[]
}) {
  return (
    <div className='grid gap-4 sm:grid-cols-12'>
      {sections.map((section) => (
        <Card
          key={section.key}
          className={`${brandPanelClassName} dark:bg-card dark:text-card-foreground ${section.key === 'orders' ? 'sm:col-span-4' : section.key === 'stones' || section.key === 'certificates' ? 'sm:col-span-8' : 'sm:col-span-6'}`}
        >
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-5xl font-bold tabular-nums'>
                {section.count.toLocaleString('en-TZ')}
              </p>
            </div>
            <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
              {section.amounts.map((amount) =>
                kind === 'financial' ? (
                  <Badge
                    key={amount.currency}
                    className='border-emerald-300 bg-emerald-100 px-3 py-1 text-base font-bold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  >
                    {formatReportBadgeMoney(
                      Number(amount.amount),
                      amount.currency
                    )}
                  </Badge>
                ) : (
                  <p
                    key={amount.currency}
                    className='font-semibold tabular-nums'
                  >
                    {formatMoney(Number(amount.amount), amount.currency)}
                  </p>
                )
              )}
              {section.statuses.map((status) => (
                <p
                  key={status.status}
                  className='text-primary-foreground/80 dark:text-muted-foreground'
                >
                  {status.status.replace(/_/g, ' ')}: {status.count}
                </p>
              ))}
              {section.categories.length > 0 && (
                <GroupedSummary
                  title='Stone categories'
                  rows={section.categories}
                />
              )}
              {section.varieties.length > 0 && (
                <GroupedSummary title='Varieties' rows={section.varieties} />
              )}
            </div>
            {section.missing_dates > 0 && (
              <Alert>
                <AlertTitle>Records without an event date</AlertTitle>
                <AlertDescription>
                  {section.missing_dates} records have no event date and are
                  excluded from the selected period.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GroupedSummary({
  title,
  rows,
}: {
  title: string
  rows: ReportSection['categories']
}) {
  return (
    <div className='basis-full space-y-3 rounded-xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-orange-100/70 p-4 shadow-sm dark:border-amber-800 dark:from-amber-950/60 dark:to-orange-950/30'>
      <div className='flex items-center gap-2'>
        <span className='size-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgb(245_158_11_/_0.15)] dark:bg-amber-400' />
        <p className='text-xs font-bold tracking-[0.16em] text-amber-950 uppercase dark:text-amber-200'>
          {title}
        </p>
      </div>
      <GroupedSummaryTable rows={rows} />
    </div>
  )
}

function GroupedSummaryTable({ rows }: { rows: ReportSection['categories'] }) {
  const rowTone = 'border-amber-200/70 dark:border-amber-800/70'
  const currencies = Array.from(
    new Set(rows.flatMap((row) => row.amounts.map((amount) => amount.currency)))
  ).sort()

  return (
    <div className='overflow-x-auto rounded-lg border border-white/60 bg-white dark:border-white/10 dark:bg-slate-950/80'>
      <table className='w-full min-w-[28rem] text-left text-sm text-slate-950 dark:text-slate-50'>
        <thead
          className={`border-b text-xs text-slate-700 uppercase dark:text-slate-200 ${rowTone}`}
        >
          <tr>
            <th scope='col' className='px-3 py-2 font-semibold'>
              Name
            </th>
            <th scope='col' className='px-3 py-2 text-center font-bold'>
              Count
            </th>
            <th scope='col' className='px-3 py-2 text-right font-semibold'>
              Amount{currencies.length ? ` (${currencies.join(', ')})` : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className={`border-b last:border-0 ${rowTone}`}>
              <th scope='row' className='px-3 py-2 font-medium'>
                {row.name || 'Unspecified'}
              </th>
              <td className='px-3 py-2 text-center font-bold tabular-nums'>
                {row.count.toLocaleString('en-TZ')}
              </td>
              <td className='px-3 py-2 text-right font-semibold tabular-nums'>
                {currencies.length ? (
                  <div className='flex flex-wrap justify-end gap-2'>
                    {currencies.map((currency) => {
                      const amount = row.amounts.find(
                        (item) => item.currency === currency
                      )
                      return amount ? (
                        <Badge
                          key={currency}
                          className='border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        >
                          {Math.round(Number(amount.amount)).toLocaleString(
                            'en-TZ'
                          )}
                        </Badge>
                      ) : (
                        <span
                          key={currency}
                          className='text-slate-500 dark:text-slate-400'
                        >
                          —
                        </span>
                      )
                    })}
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
