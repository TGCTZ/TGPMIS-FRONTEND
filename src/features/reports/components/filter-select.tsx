import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FilterSelect({
  label,
  value,
  choices,
  onChange,
}: {
  label: string
  value?: string
  choices: { id: string | number; label: string }[]
  onChange: (value: string | undefined) => void
}) {
  const id = `report-${label.toLowerCase().replace(/ /g, '-')}`
  return (
    <div className='min-w-44 space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value ?? 'all'}
        onValueChange={(next) => onChange(next === 'all' ? undefined : next)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={`All ${label.toLowerCase()}s`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          {choices.map((choice) => (
            <SelectItem key={choice.id} value={String(choice.id)}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
