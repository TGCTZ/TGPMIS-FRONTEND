import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { formatMoney } from '@/lib/format'
import { orderSchema, type Order } from '../data/schema'
import { ordersColumns } from './columns'

const controlNumberColumn = ordersColumns.find(
  (column) => column.id === 'control_number'
)

function renderControlNumber(order: Order) {
  if (!controlNumberColumn || typeof controlNumberColumn.cell !== 'function') {
    throw new Error('Control number column must provide a cell renderer')
  }

  const cell = controlNumberColumn.cell as (context: {
    row: { original: Order }
  }) => React.ReactNode

  return render(cell({ row: { original: order } }))
}

function order(overrides: Partial<Order> = {}): Order {
  return orderSchema.parse({
    id: 1,
    reference_number: 'ORD-2627-00001',
    customer: 1,
    received_date: '2026-10-19',
    ...overrides,
  })
}

describe('Orders control number column', () => {
  it('shows the bill total beneath an issued control number', async () => {
    const screen = await renderControlNumber(
      order({
        bill_number: 'BILL-2627-00001',
        control_number: '991234567890',
        bill_total_amount: '125000.00',
        bill_currency: 'TZS',
      })
    )

    await expect.element(screen.getByText('991234567890')).toBeInTheDocument()
    await expect
      .element(screen.getByText(formatMoney(125000, 'TZS', 0)))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(formatMoney(125000, 'TZS', 0)))
      .toHaveClass(/bg-success-subtle/)
    expect(
      screen.getByText(formatMoney(125000, 'TZS', 0)).element().parentElement
        ?.className
    ).toContain('flex-col')
  })

  it('shows the bill total while awaiting a control number', async () => {
    const screen = await renderControlNumber(
      order({
        bill_number: 'BILL-2627-00001',
        bill_total_amount: '125000.00',
        bill_currency: 'TZS',
      })
    )

    await expect
      .element(screen.getByText('Awaiting number'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(formatMoney(125000, 'TZS', 0)))
      .toBeInTheDocument()
    expect(
      screen.getByText(formatMoney(125000, 'TZS', 0)).element().parentElement
        ?.className
    ).toContain('flex-col')
  })

  it('shows no amount for an unbilled order', async () => {
    const screen = await renderControlNumber(order())

    await expect.element(screen.getByText('Not billed')).toBeInTheDocument()
    await expect
      .element(screen.getByText(formatMoney(125000, 'TZS', 0)))
      .not.toBeInTheDocument()
  })
})
