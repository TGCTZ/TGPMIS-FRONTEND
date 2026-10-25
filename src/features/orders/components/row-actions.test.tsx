import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { orderSchema, type Order } from '../data/schema'
import { OrdersRowActions } from './row-actions'

const mocks = vi.hoisted(() => ({ setOpen: vi.fn(), setCurrentRow: vi.fn() }))

vi.mock('../components/provider', () => ({
  useOrders: () => mocks,
}))
vi.mock('@/components/data-table', () => ({
  DataTableRowActions: ({
    actions,
  }: {
    actions: { label: string; hidden?: boolean; onSelect: () => void }[]
  }) => (
    <div>
      {actions
        .filter((action) => !action.hidden)
        .map((action) => (
          <button key={action.label} onClick={action.onSelect}>
            {action.label}
          </button>
        ))}
    </div>
  ),
}))

function makeOrder(overrides: Partial<Order> = {}): Order {
  return orderSchema.parse({
    id: 1,
    reference_number: 'ORD-2627-00001',
    customer: 1,
    received_date: '2026-10-25',
    stone_count: 1,
    identified_count: 1,
    bill_number: 'BILL-2627-00001',
    copy_available_at: new Date(Date.now() + 200).toISOString(),
    ...overrides,
  })
}

describe('OrdersRowActions pending GePG copy action', () => {
  it('shows the action after the deadline and opens its confirmation', async () => {
    const order = makeOrder()
    const screen = await render(<OrdersRowActions order={order} />)
    const action = screen.getByRole('button', {
      name: 'Create New Order',
    })

    await expect.element(action).toBeInTheDocument()
    await action.click()

    expect(mocks.setCurrentRow).toHaveBeenCalledWith(order)
    expect(mocks.setOpen).toHaveBeenCalledWith('copy-order')
  })

  it('keeps the action hidden when GePG has returned a control number', async () => {
    const screen = await render(
      <OrdersRowActions
        order={makeOrder({
          copy_available_at: new Date(Date.now() - 1000).toISOString(),
          control_number: '991234567890',
        })}
      />
    )

    await expect
      .element(
        screen.getByRole('button', {
          name: 'Create New Order',
        })
      )
      .not.toBeInTheDocument()
  })
})
