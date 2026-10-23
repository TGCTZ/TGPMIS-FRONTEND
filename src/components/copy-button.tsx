import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/** Copies a value and briefly confirms the action without changing its display. */
export function CopyButton({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`)
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className={cn(
        'size-9 shrink-0 transition-all duration-150 hover:scale-105 hover:bg-gold/70 hover:text-gold-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      onClick={() => void copy()}
      aria-label={`${copied ? 'Copied' : 'Copy'} ${label.toLowerCase()}`}
      title={`${copied ? 'Copied' : 'Copy'} ${label.toLowerCase()}`}
    >
      {copied ? <Check aria-hidden='true' /> : <Copy aria-hidden='true' />}
    </Button>
  )
}
