import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

/**
 * A switch for choosing Light or Dark.
 *
 * Also keeps the `theme-color` meta tag in sync, which is what tints the
 * browser chrome on mobile — without it a dark app keeps a white status bar.
 *
 * Light and Dark are explicit choices; the provider defaults to Dark.
 */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        className='hidden size-11 max-md:inline-flex'
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun aria-hidden='true' />
        ) : (
          <Moon aria-hidden='true' />
        )}
      </Button>
      <div className='hidden items-center gap-2 md:flex'>
        <Sun className='size-4 text-muted-foreground' aria-hidden='true' />
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
          aria-label='Dark mode'
        />
        <Moon className='size-4 text-muted-foreground' aria-hidden='true' />
      </div>
    </>
  )
}
