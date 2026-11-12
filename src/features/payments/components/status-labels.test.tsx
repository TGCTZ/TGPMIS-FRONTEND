import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { paymentSchema } from '../data/schema'
import { PaymentsTable } from './table'
import { PaymentViewDialog } from './view-dialog'

vi.mock('@/components/data-table', () => ({
  DataTable: ({ toolbar }: { toolbar: ReactNode }) => <div>{toolbar}</div>,
  DataTableColumnHeader: ({ title }: { title: string }) => <span>{title}</span>,
  DataTableRowActions: () => null,
}))

describe('payment status labels', () => {
  it('labels processed-payment filtering as Paid and keeps its true filter', async () => {
    const onStateChange = vi.fn()
    const screen = await render(
      <PaymentsTable
        data={[]}
        isFetching={false}
        state={{ page: 1, perPage: 10, search: '' }}
        onStateChange={onStateChange}
        onRowClick={vi.fn()}
      />
    )

    await screen.getByRole('combobox').click()
    await expect
      .element(screen.getByRole('option', { name: 'Paid' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('option', { name: 'Unprocessed' }))
      .toBeInTheDocument()
    await screen.getByRole('option', { name: 'Paid' }).click()

    expect(onStateChange).toHaveBeenCalledWith({ processed: '1', page: 1 })
  })

  it('shows Paid for an applied payment notification', async () => {
    const screen = await render(
      <PaymentViewDialog
        open
        onOpenChange={vi.fn()}
        payment={paymentSchema.parse({
          id: 1,
          trx_id: 'TRX-PAID-1',
          is_processed: true,
        })}
      />
    )

    await expect.element(screen.getByText('Paid')).toBeInTheDocument()
  })
})
