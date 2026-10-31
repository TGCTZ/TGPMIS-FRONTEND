import * as React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateInput, parseDateInput } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'value' | 'onChange'
> & {
  /** ISO value used by forms, URL state and API requests. */
  value?: string
  /** Receives ISO for valid dates and the raw text while the entry is invalid. */
  onChange: (value: string) => void
}

/** Text date field with a fixed day/month/year display across browser locales. */
export function DateInput({ value = '', onChange, ...props }: DateInputProps) {
  const [draft, setDraft] = React.useState(() => formatDateInput(value))
  const [open, setOpen] = React.useState(false)
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date()
    const [year, month] = value.split('-').map(Number)
    return new Date(year, month - 1, 1)
  })

  React.useEffect(() => {
    setDraft(formatDateInput(value))
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-').map(Number)
      setVisibleMonth(new Date(year, month - 1, 1))
    }
  }, [value])

  const monthStart = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  )
  const leadingDays = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  ).getDate()
  const selectedDate = parseDateInput(draft)
  const selectedDay = selectedDate ? Number(selectedDate.slice(8, 10)) : null
  const selectedMonth = selectedDate
    ? Number(selectedDate.slice(5, 7)) - 1
    : null
  const selectedYear = selectedDate ? Number(selectedDate.slice(0, 4)) : null
  const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, 1 + index)
    return new Intl.DateTimeFormat('en-TZ', { weekday: 'short' }).format(date)
  })

  function selectDay(day: number) {
    const year = visibleMonth.getFullYear()
    const month = String(visibleMonth.getMonth() + 1).padStart(2, '0')
    const date = String(day).padStart(2, '0')
    const iso = `${year}-${month}-${date}`
    setDraft(formatDateInput(iso))
    onChange(iso)
    setOpen(false)
  }

  return (
    <div className='relative'>
      <Input
        {...props}
        className={`pr-10 ${props.className ?? ''}`}
        type='text'
        inputMode='numeric'
        placeholder='dd/mm/yyyy'
        value={draft}
        onChange={(event) => {
          const next = event.target.value
          setDraft(next)
          onChange(next === '' ? '' : (parseDateInput(next) ?? next))
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Choose date'
            className='absolute top-1/2 right-1 size-7 -translate-y-1/2 bg-background text-foreground opacity-100 hover:bg-accent active:-translate-y-1/2'
          >
            <CalendarDays aria-hidden='true' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-72 p-3' align='end'>
          <div className='mb-2 flex items-center justify-between'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label='Previous month'
              className='size-8'
              onClick={() =>
                setVisibleMonth(
                  (month) =>
                    new Date(month.getFullYear(), month.getMonth() - 1, 1)
                )
              }
            >
              <ChevronLeft aria-hidden='true' />
            </Button>
            <div aria-live='polite' className='text-sm font-medium'>
              {new Intl.DateTimeFormat('en-TZ', {
                month: 'long',
                year: 'numeric',
              }).format(visibleMonth)}
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label='Next month'
              className='size-8'
              onClick={() =>
                setVisibleMonth(
                  (month) =>
                    new Date(month.getFullYear(), month.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight aria-hidden='true' />
            </Button>
          </div>
          <div className='grid grid-cols-7 gap-1 text-center'>
            {weekdayLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className='py-1 text-xs text-muted-foreground'
              >
                {label}
              </span>
            ))}
            {Array.from({ length: 42 }, (_, index) => {
              const day = index - leadingDays + 1
              if (day < 1 || day > daysInMonth) {
                return <span key={`empty-${index}`} />
              }

              const isSelected =
                day === selectedDay &&
                visibleMonth.getMonth() === selectedMonth &&
                visibleMonth.getFullYear() === selectedYear

              return (
                <Button
                  key={day}
                  type='button'
                  variant={isSelected ? 'default' : 'ghost'}
                  size='icon'
                  aria-label={`${String(day).padStart(2, '0')}/${String(visibleMonth.getMonth() + 1).padStart(2, '0')}/${visibleMonth.getFullYear()}`}
                  aria-pressed={isSelected}
                  className='size-8 text-sm'
                  onClick={() => selectDay(day)}
                >
                  {day}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
