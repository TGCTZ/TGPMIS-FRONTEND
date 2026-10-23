import { cn } from '@/lib/utils'

type ProgressProps = {
  /** Work completed so far. Omit for work whose total is unknown. */
  value?: number
  /** The total the bar fills up to. */
  max?: number
  /** Accessible name, since the bar itself carries no text. */
  label: string
  className?: string
  /** Overrides the fill once the bar is full. Defaults to the success colour. */
  completeClassName?: string
}

/**
 * A progress bar for known or unknown totals.
 *
 * Hand-rolled rather than `@radix-ui/react-progress` to keep the existing
 * compact styling while supporting transfer progress with unknown totals.
 *
 * Determinate bars expose their values to assistive technology. Indeterminate
 * bars omit `aria-valuenow` because no accurate percentage is available.
 */
export function Progress({
  value,
  max,
  label,
  className,
  completeClassName = 'bg-success',
}: ProgressProps) {
  const safeMax = Math.max(0, max ?? 100)
  const safeValue = Math.min(Math.max(0, value ?? 0), safeMax)
  const percent = safeMax === 0 ? 0 : (safeValue / safeMax) * 100
  const isDeterminate = value !== undefined
  const isComplete = isDeterminate && safeMax > 0 && safeValue >= safeMax

  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={isDeterminate ? 0 : undefined}
      aria-valuemax={isDeterminate ? safeMax : undefined}
      aria-valuenow={isDeterminate ? safeValue : undefined}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-300',
          isDeterminate
            ? isComplete
              ? completeClassName
              : 'bg-warning'
            : 'w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] bg-warning'
        )}
        style={isDeterminate ? { width: `${percent}%` } : undefined}
      />
    </div>
  )
}
