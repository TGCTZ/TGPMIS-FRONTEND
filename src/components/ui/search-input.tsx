import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'

type SearchInputProps = Omit<React.ComponentProps<'input'>, 'placeholder'> & {
  containerClassName?: string
}

/** Shared search field with a consistent icon, placeholder and report styling. */
export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', containerClassName)}>
      <Search
        aria-hidden='true'
        className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-700'
      />
      <Input
        placeholder='Search...'
        className={cn(
          'h-11 w-full rounded-lg border-slate-300 bg-white ps-10 text-slate-900 shadow-sm placeholder:text-slate-600 placeholder:opacity-100 focus-visible:border-slate-500 focus-visible:ring-slate-500/30 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-600',
          className
        )}
        {...props}
      />
    </div>
  )
}
