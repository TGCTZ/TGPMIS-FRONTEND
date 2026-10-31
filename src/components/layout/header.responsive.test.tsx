import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { Header } from './header'

vi.mock('@tanstack/react-router', () => ({
  useCanGoBack: () => false,
  useRouter: () => ({ history: { go: vi.fn() } }),
}))

vi.mock('@/context/layout-provider', () => ({
  useLayout: () => ({ collapsible: 'offcanvas' }),
}))

vi.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button type='button' data-slot='sidebar-trigger' className={className}>
      Toggle navigation
    </button>
  ),
  useSidebar: () => ({
    state: 'collapsed',
    isMobile: window.matchMedia('(max-width: 767px)').matches,
  }),
}))

vi.mock('@/components/can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('./breadcrumbs', () => ({
  Breadcrumbs: ({ className }: { className?: string }) => (
    <nav aria-label='Breadcrumbs' className={className}>
      Orders
    </nav>
  ),
}))

function renderHeader() {
  return render(
    <Header>
      <button type='button' aria-label='Theme control' className='size-11'>
        Theme
      </button>
      <button type='button' aria-label='Profile control' className='size-11'>
        Profile
      </button>
    </Header>
  )
}

describe('Header responsiveness', () => {
  it.each([320, 458, 767])(
    'keeps the mobile header controls separated at %i px',
    async (width) => {
      await page.viewport(width, 630)
      const screen = await renderHeader()
      const header = screen.container.querySelector('header')
      expect(header).not.toBeNull()

      const controls = [
        header!.querySelector('[data-slot="sidebar-trigger"]'),
        screen.getByRole('button', { name: 'Go back' }),
        screen.getByRole('button', { name: 'More actions' }),
        screen.getByRole('button', { name: 'Theme control' }),
        screen.getByRole('button', { name: 'Profile control' }),
      ].filter(
        (element): element is HTMLElement => element instanceof HTMLElement
      )

      const bounds = controls
        .map((element) => element.getBoundingClientRect())
        .sort((left, right) => left.left - right.left)

      for (let index = 1; index < bounds.length; index += 1) {
        expect(bounds[index - 1].right).toBeLessThanOrEqual(
          bounds[index].left + 1
        )
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width)
      expect(
        screen.container.querySelector('[aria-label="Breadcrumbs"]')
      ).toBeNull()

      await userEvent.click(
        screen.getByRole('button', { name: 'More actions' })
      )
      await expect
        .element(screen.getByRole('menuitem', { name: 'Open Legacy System' }))
        .toBeInTheDocument()
    }
  )

  it('keeps the labelled legacy link visible on desktop', async () => {
    await page.viewport(1024, 768)
    const screen = await renderHeader()

    await expect
      .element(screen.getByRole('link', { name: 'Open Legacy System' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('navigation', { name: 'Breadcrumbs' }))
      .toBeInTheDocument()
  })
})
