import { useAuthStore } from '@/stores/auth-store'

const fields = [
  { label: 'First name', key: 'first_name' },
  { label: 'Middle name', key: 'middle_name' },
  { label: 'Last name', key: 'last_name' },
  { label: 'Username', key: 'username' },
  { label: 'Email', key: 'email' },
  { label: 'Phone number', key: 'phone_number' },
  { label: 'Bio', key: 'bio' },
] as const

export function ProfileDetails() {
  const user = useAuthStore((state) => state.auth.user)

  if (!user) return null

  return (
    <dl className='grid gap-3 sm:grid-cols-2'>
      {fields.map(({ label, key }) => (
        <div
          key={key}
          className={`rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm dark:bg-muted/20 dark:text-foreground ${key === 'bio' ? 'sm:col-span-2' : ''}`}
        >
          <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
          <dd className='mt-1.5 text-sm leading-6 font-semibold break-words whitespace-pre-wrap'>
            {user[key]?.trim() || '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}
