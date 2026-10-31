import { useEffect, useState } from 'react'
import { ExternalLink, MoreHorizontal } from 'lucide-react'
import { PERMISSIONS } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { useLayout } from '@/context/layout-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Can } from '@/components/can'
import { BackButton } from './back-button'
import { Breadcrumbs } from './breadcrumbs'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

/**
 * The page header bar: where you are and how you got here on one side, the
 * page's own controls on the other.
 *
 * The sidebar toggle and back button stay visible at every width. Breadcrumbs
 * are hidden on phones; where shown, the trail is derived from the URL, so it
 * cannot contradict the sidebar the user just clicked. See `./breadcrumbs.tsx`.
 * The permitted legacy-system link moves into the overflow menu on phones.
 *
 * The sidebar trigger is unconditional: it is the only control that collapses
 * or reopens the sidebar, in every collapse mode.
 *
 * **`children` are wrapped in a right-aligned cluster.** Pass controls in
 * reading order and nothing else: an `ms-auto` or `me-auto` on a child now
 * fights the wrapper instead of helping it.
 *
 * The bar paints `--sidebar`, the navigation surface: header and sidebar are one
 * continuous band of chrome around the content, so they share a colour. The
 * fill is opaque so content never reads through a `fixed` header; past 10px of
 * scroll a shadow marks the lift.
 *
 * @param props.fixed - Stick to the top of the scroll container
 * @param props.children - The page's controls, laid out at the end of the bar
 */
export function Header({
  className,
  fixed = true,
  style,
  children,
  ...props
}: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { state, isMobile } = useSidebar()
  const { collapsible } = useLayout()

  const sidebarOffset = isMobile
    ? '0px'
    : collapsible === 'none' || state === 'expanded'
      ? 'var(--sidebar-width)'
      : collapsible === 'icon'
        ? 'var(--sidebar-width-icon)'
        : '0px'

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {fixed && <div aria-hidden='true' className='h-16 shrink-0' />}
      <header
        data-slot='page-header'
        className={cn(
          'z-50 h-16 border-b border-border bg-background text-foreground dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground',
          fixed &&
            'fixed end-0 top-0 transition-[inset-inline-start] duration-200',
          offset > 10 && fixed ? 'shadow' : 'shadow-none',
          className
        )}
        style={{
          ...style,
          insetInlineStart: fixed ? sidebarOffset : undefined,
        }}
        {...props}
      >
        <div className='relative flex h-full items-center gap-2 p-2 sm:gap-4 sm:p-4'>
          <SidebarTrigger variant='outline' className='max-md:size-11' />
          <Separator orientation='vertical' className='h-6' />
          <BackButton />
          {!isMobile && <Breadcrumbs className='min-w-0 flex-1' />}
          <div className='ms-auto flex shrink-0 items-center gap-1 sm:gap-4'>
            <Can permission={PERMISSIONS.accessLegacySystem}>
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='size-11'
                      aria-label='More actions'
                    >
                      <MoreHorizontal aria-hidden='true' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild className='min-h-11'>
                      <a
                        href='https://legacy.tgpmis.tgc.ac.tz'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <ExternalLink aria-hidden='true' />
                        Open Legacy System
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant='outline' size='sm'>
                  <a
                    href='https://legacy.tgpmis.tgc.ac.tz'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink aria-hidden='true' className='size-4' />
                    Open Legacy System
                  </a>
                </Button>
              )}
            </Can>
            {children}
          </div>
        </div>
      </header>
    </>
  )
}
