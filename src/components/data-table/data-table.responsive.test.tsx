import { type ColumnDef } from '@tanstack/react-table'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { DataTable, type TableQueryState } from './data-table'

/**
 * Responsive regression guard for the shared list surface.
 *
 * Shared server-driven lists use `<DataTable>`, so its mobile contract is
 * worth pinning here once rather than per feature. These run in a real
 * Chromium viewport — `page.viewport()` resizes the actual window, so the
 * media query behind `useIsMobile` and the CSS breakpoints are the real ones,
 * not a mocked `matchMedia`.
 *
 * Include the smallest supported phone, the supplied screenshot width, and
 * both sides of the mobile breakpoint.
 */
const MOBILE_WIDTHS = [320, 375, 458, 767]
const DESKTOP = { width: 1280, height: 800 }

type Row = { id: number; bill_number: string; customer_name: string }

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'bill_number',
    header: () => <span>Bill</span>,
    meta: { label: 'Bill' },
    cell: ({ row }) => <span>{row.original.bill_number}</span>,
  },
  {
    accessorKey: 'customer_name',
    header: () => <span>Customer</span>,
    meta: { label: 'Customer' },
    cell: ({ row }) => <span>{row.original.customer_name}</span>,
  },
]

const data: Row[] = [
  { id: 1, bill_number: 'B-001', customer_name: 'Asha Mollel' },
  { id: 2, bill_number: 'B-002', customer_name: 'Juma Kileo' },
]

const state: TableQueryState = { page: 1, perPage: 10, search: '' }

function renderTable(
  overrides: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}
) {
  return render(
    <DataTable
      columns={columns}
      data={data}
      meta={{ current_page: 1, per_page: 10, last_page: 1, total: 2 }}
      isFetching={false}
      state={state}
      onStateChange={vi.fn()}
      {...overrides}
    />
  )
}

describe('DataTable responsiveness', () => {
  it('keeps existing rows visible and announces a background refresh', async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height)
    const screen = await renderTable({ isFetching: true })

    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent('Updating…')
    await expect.element(screen.getByText('B-001')).toBeInTheDocument()
  })

  it('keeps rows visible and offers retry after a refresh failure', async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height)
    const onRetry = vi.fn()
    const screen = await renderTable({ refreshError: true, onRetry })

    await expect
      .element(screen.getByText(/Showing the previous results/))
      .toBeInTheDocument()
    await expect.element(screen.getByText('B-001')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not show the refresh cue during an initial load', async () => {
    const screen = await renderTable({ data: [], isFetching: true })

    await expect.element(screen.getByRole('status')).not.toBeInTheDocument()
  })

  it.each([768, 1024, DESKTOP.width])(
    'renders a real table at %i px',
    async (width) => {
      await page.viewport(width, DESKTOP.height)
      const screen = await renderTable()

      await expect.element(screen.getByRole('table')).toBeInTheDocument()
    }
  )

  it.each(MOBILE_WIDTHS)(
    'renders labelled cards instead of a table at %i px',
    async (width) => {
      await page.viewport(width, 667)
      const screen = await renderTable()

      // The card view must replace the table outright. Rendering both would
      // duplicate every row action in the accessibility tree.
      expect(screen.container.querySelector('table')).toBeNull()

      // Each value keeps its label, which is what horizontal scrolling loses.
      await expect
        .element(screen.getByRole('term').first())
        .toHaveTextContent('Bill')
      await expect.element(screen.getByText('B-001')).toBeInTheDocument()
      await expect.element(screen.getByText('Asha Mollel')).toBeInTheDocument()
    }
  )

  it.each(MOBILE_WIDTHS)(
    'does not overflow the viewport horizontally at %i px',
    async (width) => {
      await page.viewport(width, 667)
      await renderTable()

      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width)
    }
  )

  it('does not open the row when a nested action is clicked', async () => {
    await page.viewport(375, 667)
    const onAction = vi.fn()
    const onRowClick = vi.fn()
    const columnsWithAction: ColumnDef<Row>[] = [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <button type='button' onClick={onAction}>
            Row action
          </button>
        ),
      },
    ]
    const screen = await renderTable({
      columns: columnsWithAction,
      onRowClick,
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Row action', exact: true }).first()
    )

    expect(onAction).toHaveBeenCalledOnce()
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('exposes the row as a keyboard-activatable control when clickable', async () => {
    await page.viewport(375, 667)
    const onRowClick = vi.fn()
    const screen = await renderTable({ onRowClick })

    const card = screen.container.querySelector('[role="button"][tabindex="0"]')
    expect(card).not.toBeNull()
    await userEvent.click(card as HTMLElement)

    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('leaves the card inert when there is no detail view to open', async () => {
    await page.viewport(375, 667)
    const screen = await renderTable()

    expect(screen.container.querySelectorAll('[role="button"]')).toHaveLength(0)
  })
})
