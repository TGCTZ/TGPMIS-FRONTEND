import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CopyPlus, Pencil } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/format'
import { perm } from '@/lib/permissions'
import { regionLabel } from '@/lib/regions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Can } from '@/components/can'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type RowAction } from '@/components/data-table'
import { DefinitionList } from '@/components/definition-list'
import { DialogBody } from '@/components/dialog-body'
import { StatusBadge } from '@/components/status-badge'
import { ViewFooterActions } from '@/components/view-footer-actions'
import { orderQuery } from '../data/api'
import { isFullyIdentified, type Order } from '../data/schema'
import { OrderStonesPanel } from './stones-panel'

type OrderViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  /** Switches the view into the edit form, when the user may edit. */
  onRequestEdit?: () => void
  /** Opens the identification dialog from the embedded stones panel. */
  onRegisterStone?: () => void
  /** Creates a separate copy after the pending GePG timeout. */
  onCopyOrder?: (order: Order) => void
  isCopying?: boolean
  actions?: RowAction[]
}

/**
 * Everything known about one order.
 *
 * Its own component rather than the mutate form with `disabled` on a fieldset.
 * A greyed-out form reads as "you may not touch this", which is the wrong
 * message — most users viewing an order *can* edit it, they simply are not
 * editing it yet. It also buries the facts: a disabled `<input type='date'>`
 * shows a date picker where a date should be, and the customer, who is the
 * first thing anyone wants, sits behind a combobox.
 *
 * A definition list states the record; Edit is an explicit step from here.
 */
export function OrderViewDialog({
  open,
  onOpenChange,
  order,
  onRequestEdit,
  onRegisterStone,
  onCopyOrder,
  isCopying = false,
  actions = [],
}: OrderViewDialogProps) {
  const [reachedDeadline, setReachedDeadline] = useState<string | null>(null)
  const [confirmCopyOpen, setConfirmCopyOpen] = useState(false)
  const detailQuery = useQuery({
    ...orderQuery(order.id),
    enabled: open && Boolean(order.bill_number) && !order.control_number,
    refetchInterval: (query) =>
      query.state.data?.control_number ? false : 30_000,
  })
  const currentOrder = detailQuery.data ?? order
  const copyAvailableAt = currentOrder.copy_available_at

  useEffect(() => {
    if (!open || !copyAvailableAt) return

    const delay = Date.parse(copyAvailableAt) - Date.now()
    const timer = window.setTimeout(
      () => setReachedDeadline(copyAvailableAt),
      Math.max(0, delay)
    )
    return () => window.clearTimeout(timer)
  }, [open, copyAvailableAt])

  const canCopyOrder = Boolean(
    onCopyOrder &&
    copyAvailableAt &&
    reachedDeadline === copyAvailableAt &&
    !currentOrder.control_number &&
    !currentOrder.deleted_at
  )
  const complete = isFullyIdentified(currentOrder)
  const customer = currentOrder.customer_detail
  const remaining = Math.max(
    0,
    currentOrder.stone_count - currentOrder.identified_count
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex flex-wrap items-center gap-2'>
            {currentOrder.reference_number}
            <StatusBadge tone={complete ? 'success' : 'info'}>
              {complete ? 'Fully identified' : 'Awaiting identification'}
            </StatusBadge>
            {currentOrder.bill_number && (
              <StatusBadge tone='warning'>
                Billed {currentOrder.bill_number}
              </StatusBadge>
            )}
            {currentOrder.deleted_at && (
              <StatusBadge tone='danger'>Deleted</StatusBadge>
            )}
          </DialogTitle>
          <DialogDescription>
            Received {formatDate(currentOrder.received_date)}
            {customer ? ` · ${customer.full_name}` : ''}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className='space-y-5'>
          {/* Progress leads: it is the one thing that decides what happens to
              this order next — more identification, or a bill. */}
          <div className='space-y-2 rounded-md border p-3'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <h3 className='text-sm font-medium'>Identification progress</h3>
              <span className='text-xs text-muted-foreground tabular-nums'>
                {currentOrder.identified_count} of {currentOrder.stone_count}{' '}
                identified
                {remaining > 0 && ` · ${remaining} to go`}
              </span>
            </div>
            <Progress
              value={currentOrder.identified_count}
              max={currentOrder.stone_count}
              label={`Identification progress for ${currentOrder.reference_number}`}
            />
          </div>

          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Customer</h3>
            <DefinitionList
              items={[
                { label: 'Name', value: customer?.full_name ?? null },
                { label: 'Phone', value: customer?.phone ?? null },
                { label: 'Company', value: customer?.company_name ?? null },
                {
                  label: 'Region',
                  value: regionLabel(customer?.region) || null,
                },
                { label: 'Email', value: customer?.email ?? null },
                { label: 'ID number', value: customer?.id_number ?? null },
                {
                  label: 'Address',
                  value: customer?.address ?? null,
                  wide: true,
                },
              ]}
            />
          </div>

          <Separator />

          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Order</h3>
            <DefinitionList
              items={[
                { label: 'Reference', value: currentOrder.reference_number },
                {
                  label: 'Received',
                  value: formatDate(currentOrder.received_date),
                },
                { label: 'Stones submitted', value: currentOrder.stone_count },
                {
                  label: 'Stones identified',
                  value: currentOrder.identified_count,
                },
                { label: 'Bill', value: currentOrder.bill_number },
                {
                  label: 'Created',
                  value: formatDateTime(currentOrder.created_at),
                },
                {
                  label: 'Last updated',
                  value: formatDateTime(currentOrder.updated_at),
                },
              ]}
            />
          </div>

          <Separator />

          <OrderStonesPanel order={currentOrder} onRegister={onRegisterStone} />
        </DialogBody>

        <DialogFooter>
          <ViewFooterActions
            actions={actions.filter(
              (action) => action.label !== 'Create new order for this customer'
            )}
            primary={
              <div className='flex flex-wrap gap-2'>
                {onRequestEdit && !currentOrder.bill_number && (
                  <Can permission={perm('orders', 'change')}>
                    <Button onClick={onRequestEdit}>
                      <Pencil className='me-1 size-4' />
                      Edit
                    </Button>
                  </Can>
                )}
                {canCopyOrder && (
                  <Can permission={perm('orders', 'add')}>
                    <Button
                      variant='outline'
                      onClick={() => setConfirmCopyOpen(true)}
                      disabled={isCopying}
                    >
                      <CopyPlus className='me-1 size-4' />
                      Create new order for this customer
                    </Button>
                  </Can>
                )}
              </div>
            }
          />
        </DialogFooter>
      </DialogContent>
      <ConfirmDialog
        open={confirmCopyOpen}
        onOpenChange={setConfirmCopyOpen}
        title='Create a new order?'
        desc={`This will create a separate copy of ${currentOrder.reference_number}, including its stones and identification findings. The original order and its GePG request will remain unchanged. GePG may still return a control number for the original, so both orders could require payment.`}
        confirmText={isCopying ? 'Creating order…' : 'Create new order'}
        isLoading={isCopying}
        handleConfirm={() => onCopyOrder?.(currentOrder)}
      />
    </Dialog>
  )
}
