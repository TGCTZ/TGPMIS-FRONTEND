import '@/styles/index.css'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { DataTableRowActions } from './row-actions'

describe('DataTableRowActions responsiveness', () => {
  it('keeps phone cards compact and exposes labelled actions in the menu', async () => {
    await page.viewport(320, 667)
    const onView = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const screen = await render(
      <DataTableRowActions
        actions={[
          { label: 'View', icon: Eye, onSelect: onView },
          { label: 'Edit', icon: Pencil, onSelect: onEdit },
          {
            label: 'Delete',
            icon: Trash2,
            onSelect: onDelete,
            tone: 'destructive',
          },
        ]}
      />
    )

    const trigger = screen.container.querySelector(
      'button[aria-label^="Open row actions"]'
    ) as HTMLButtonElement
    expect(trigger.getBoundingClientRect().width).toBeGreaterThanOrEqual(44)
    await userEvent.click(trigger)

    await expect
      .element(screen.getByRole('menuitem', { name: 'View' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('menuitem', { name: 'Edit' }))
      .toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('keeps labelled action buttons on desktop', async () => {
    await page.viewport(1024, 768)
    const screen = await render(
      <DataTableRowActions
        actions={[{ label: 'View', icon: Eye, onSelect: vi.fn() }]}
      />
    )

    await expect
      .element(screen.getByRole('button', { name: 'View' }))
      .toBeInTheDocument()
  })
})
