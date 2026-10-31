import '@/styles/index.css'
import { Plus } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { Button } from '@/components/ui/button'
import { PageHeading } from './page-heading'

describe('PageHeading responsiveness', () => {
  it('keeps the title, hides the description, and shows icon-only actions on small screens', async () => {
    await page.viewport(458, 630)
    const screen = await render(
      <PageHeading title='Orders' description='Customer visits and stones.'>
        <Button>
          Create order
          <Plus aria-hidden='true' />
        </Button>
      </PageHeading>
    )

    const title = screen.getByRole('heading', { name: 'Orders' }).element()
    const description = screen
      .getByText('Customer visits and stones.')
      .element()
    const button = screen
      .getByRole('button', { name: 'Create order' })
      .element()

    expect(getComputedStyle(title).display).not.toBe('none')
    expect(getComputedStyle(description).display).toBe('none')
    expect(getComputedStyle(button).fontSize).toBe('0px')
    expect(button.getBoundingClientRect().width).toBe(44)
    expect(button.getBoundingClientRect().height).toBe(44)
  })

  it('keeps page titles visible on small screens when there are no actions', async () => {
    await page.viewport(375, 667)
    const screen = await render(<PageHeading title='Audit log' />)

    await expect
      .element(screen.getByRole('heading', { name: 'Audit log' }))
      .toBeInTheDocument()
    expect(
      getComputedStyle(screen.container.firstElementChild!).display
    ).not.toBe('none')
  })

  it('keeps full headings and action labels on desktop', async () => {
    await page.viewport(1024, 768)
    const screen = await render(
      <PageHeading title='Orders' description='Customer visits and stones.'>
        <Button>
          Create order
          <Plus aria-hidden='true' />
        </Button>
      </PageHeading>
    )

    await expect
      .element(screen.getByRole('heading', { name: 'Orders' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Customer visits and stones.'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Create order' }))
      .toBeInTheDocument()
  })
})
