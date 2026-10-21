import { Input } from '@/components/ui/input'
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
        <Input
          id='report-from'
          type='date'
          value={from}
          onChange={(event) =>
            onChange({ from: event.target.value, rangePreset: undefined })
          }
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='report-to'>To</Label>
        <Input
          id='report-to'
          type='date'
          value={to}
          onChange={(event) =>
            onChange({ to: event.target.value, rangePreset: undefined })
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
