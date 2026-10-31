import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  dateRangePresets,
  periodForPreset,
  periodPresetForRange,
} from '../data/period'
import { type ReportSearch } from '../data/schema'

/** Identical lab-day controls on summary and detail pages. */
export function ReportPeriodControls({
  from,
  to,
  preferredRangePreset,
  onChange,
}: {
  from: string
  to: string
  preferredRangePreset?: ReportSearch['rangePreset']
  onChange: (next: Partial<ReportSearch>) => void
}) {
  return (
    <>
      <div className='space-y-2'>
        <Label htmlFor='report-from'>From</Label>
        <DateInput
          id='report-from'
          value={from}
          onChange={(value) =>
            value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value)
              ? onChange({ from: value, rangePreset: undefined })
              : undefined
          }
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='report-to'>To</Label>
        <DateInput
          id='report-to'
          value={to}
          onChange={(value) =>
            value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value)
              ? onChange({ to: value, rangePreset: undefined })
              : undefined
          }
        />
      </div>
      <div className='min-w-48 space-y-2'>
        <Label htmlFor='report-date-range'>Date range</Label>
        <Select
          value={periodPresetForRange(
            from,
            to,
            new Date(),
            preferredRangePreset
          )}
          onValueChange={(value) => {
            const preset = dateRangePresets.find(
              (option) => option.value === value
            )
            if (preset)
              onChange({
                ...periodForPreset(preset.value),
                rangePreset: preset.value,
              })
          }}
        >
          <SelectTrigger id='report-date-range'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='custom' disabled>
              Custom range
            </SelectItem>
            {dateRangePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
