import { type ColumnDef } from '@tanstack/react-table'
import { formatMoney } from '@/lib/format'
import { Progress } from '@/components/ui/progress'
import { CopyButton } from '@/components/copy-button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/status-badge'
import {
  ORDER_STAGE_TONES,
  isFullyIdentified,
  type Order,
} from '../data/schema'
import { OrdersRowActions } from './row-actions'

/**
 * Order data columns, kept separate so the Orders page can add its row actions.
 */
const ordersDataColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'reference_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    // The customer sits under the reference rather than in a column of their
    // own: an order is identified by both together — "ORD-2627-12, Christopher
    // Miller" is how anyone at the desk refers to it — and splitting them across
    // two columns made the eye travel for half the identity.
    cell: ({ row }) => {
      const customer = row.original.customer_detail

      return (
        <div className='min-w-0 md:min-w-44'>
          <div className='flex items-center gap-2 font-medium'>
            {row.original.reference_number}
            {row.original.deleted_at && (
              <StatusBadge tone='danger'>Deleted</StatusBadge>
            )}
          </div>
          {customer ? (
            <>
              <LongText className='max-w-52 text-sm'>
                {customer.full_name}
              </LongText>
              <div className='text-xs text-muted-foreground'>
                {customer.phone}
              </div>
            </>
          ) : (
            <div className='text-xs text-muted-foreground'>No customer</div>
          )}
        </div>
      )
    },
  },
  {
    id: 'stones',
    header: () => <span>Stones</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original
      const complete = isFullyIdentified(order)

      return (
        <div className='w-40 space-y-1.5'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-xs tabular-nums'>
              {order.identified_count} of {order.stone_count} identified
            </span>
            {/* An order is only ready to bill once every stone is identified. */}
            <StatusBadge tone={complete ? 'success' : 'info'}>
              {complete ? 'Done' : 'Pending'}
            </StatusBadge>
          </div>
          <Progress
            value={order.identified_count}
            max={order.stone_count}
            label={`Identification progress for ${order.reference_number}`}
          />
        </div>
      )
    },
  },
  {
    id: 'control_number',
    meta: { align: 'center' },
    header: () => <span>Control number</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original

      // Three distinct states, and the middle one is the whole reason this
      // column exists: a bill was raised but GePG never answered, so the
      // customer has nothing to quote and nobody would otherwise notice.
      if (!order.bill_number) {
        return <span className='text-xs text-muted-foreground'>Not billed</span>
      }

      return (
        <div className='flex flex-col items-start gap-1'>
          {order.control_number ? (
            <div className='flex items-center gap-1 font-medium tabular-nums'>
              {order.control_number}
              <CopyButton label='control number' value={order.control_number} />
            </div>
          ) : (
            <StatusBadge tone='danger'>Awaiting number</StatusBadge>
          )}
          {order.bill_total_amount !== null && (
            <StatusBadge tone='success' className='tabular-nums'>
              {formatMoney(
                Number(order.bill_total_amount),
                order.bill_currency ?? undefined,
                0
              )}
            </StatusBadge>
          )}
        </div>
      )
    },
  },
  {
    id: 'stage',
    meta: { align: 'center' },
    header: () => <span>Status</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const order = row.original

      return (
        <div className='min-w-0 space-y-1 md:min-w-36'>
          {/* The label comes from the server so the words cannot drift from the
              rule that produced them; only the emphasis is decided here. */}
          <StatusBadge tone={ORDER_STAGE_TONES[order.stage]}>
            {order.stage_label || order.stage}
          </StatusBadge>
          {order.hold_reason && (
            <LongText className='max-w-40 text-xs text-muted-foreground'>
              {order.hold_reason}
            </LongText>
          )}
        </div>
      )
    },
  },
]

export const ordersColumns: ColumnDef<Order>[] = [
  ...ordersDataColumns,
  {
    id: 'actions',
    meta: { align: 'center' },
    cell: ({ row }) => <OrdersRowActions order={row.original} />,
  },
]
