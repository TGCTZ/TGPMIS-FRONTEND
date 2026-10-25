import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { orderSchema, type Order } from '../data/schema'
import { OrderViewDialog } from './view-dialog'

const mocks = vi.hoisted(() => ({ fetchOrder: vi.fn() }))

vi.mock('../data/api', () => ({
  orderQuery: (id: number) => ({
    queryKey: ['orders', 'detail', id],
    queryFn: () => mocks.fetchOrder(id),
  }),
}))
vi.mock('./stones-panel', () => ({ OrderStonesPanel: () => null }))
vi.mock('@/components/can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/components/view-footer-actions', () => ({
  ViewFooterActions: ({ primary }: { primary?: React.ReactNode }) => primary,
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
    copy_available_at: new Date(Date.now() - 1000).toISOString(),
    customer_detail: {
      id: 1,
      first_name: 'Asha',
      last_name: 'Mwinyi',
      full_name: 'Asha Mwinyi',
      phone: '255700000000',
    },
    ...overrides,
  })
}

async function renderOrder(order: Order, onCopyOrder = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <OrderViewDialog
        open
        onOpenChange={() => {}}
        order={order}
        onCopyOrder={onCopyOrder}
      />
    </QueryClientProvider>
  )
  return { screen, onCopyOrder }
}

describe('OrderViewDialog pending GePG copy action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.fetchOrder.mockImplementation(async (id: number) => makeOrder({ id }))
  })

  it('keeps the copy action hidden before the timeout', async () => {
    const order = makeOrder({
      copy_available_at: new Date(Date.now() + 60_000).toISOString(),
    })
    mocks.fetchOrder.mockResolvedValue(order)
    const { screen } = await renderOrder(order)

    await expect
      .element(
        screen.getByRole('button', {
          name: 'Create new order for this customer',
        })
      )
      .not.toBeInTheDocument()
  })

  it('shows the copy action when the timeout passes while the dialog stays open', async () => {
    const order = makeOrder({
      copy_available_at: new Date(Date.now() + 250).toISOString(),
    })
    mocks.fetchOrder.mockResolvedValue(order)
    const { screen } = await renderOrder(order)

    await expect
      .element(
        screen.getByRole('button', {
          name: 'Create new order for this customer',
        })
      )
      .toBeInTheDocument()
  })

  it('hides the copy action when a late GePG response has a control number', async () => {
    mocks.fetchOrder.mockResolvedValue(
      makeOrder({ control_number: '991234567890' })
    )
    const { screen } = await renderOrder(makeOrder())

    await expect
      .element(
        screen.getByRole('button', {
          name: 'Create new order for this customer',
        })
      )
      .not.toBeInTheDocument()
  })
})
