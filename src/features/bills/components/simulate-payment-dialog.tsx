import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/format'
import { serverMessageOr } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { simulateBillPayment } from '../data/api'
import { type Bill } from '../data/schema'

type SimulatePaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill
}

/** Settle the outstanding bill balance without the gateway. Development only. */
export function SimulatePaymentDialog({
  open,
  onOpenChange,
  bill,
}: SimulatePaymentDialogProps) {
  const queryClient = useQueryClient()

  const total = Number(bill.total_amount ?? 0)
  const paid = Number(bill.amount_paid ?? 0)
  const outstanding = Math.max(0, total - paid)

  const mutation = useMutation({
    mutationFn: () => simulateBillPayment(bill.id),
    onSuccess: async (updated) => {
      toast.success(
        `${updated.bill_number} has been settled`,
        {
          description:
            'Every stone on the order has moved to paid and is ready for findings.',
        }
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['stones'] }),
        queryClient.invalidateQueries({ queryKey: ['worklist'] }),
        queryClient.invalidateQueries({ queryKey: ['workflow-feed'] }),
      ])
      onOpenChange(false)
    },
    onError: (error) =>
      toast.error('The payment was not simulated', {
        description: serverMessageOr(
          error,
          'Something went wrong and the bill is unchanged. Please try again.'
        ),
      }),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <FlaskConical className='size-4' />
            Simulate payment
          </DialogTitle>
          <DialogDescription>
            Sends a test GePG notification through the live payment handler.
          </DialogDescription>
        </DialogHeader>

        <dl className='grid grid-cols-1 gap-2 rounded-md border p-3 text-sm sm:grid-cols-3'>
          <div>
            <dt className='text-xs text-muted-foreground'>Total</dt>
            <dd className='tabular-nums'>
              {formatMoney(total, bill.currency)}
            </dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Received</dt>
            <dd className='tabular-nums'>{formatMoney(paid, bill.currency)}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Outstanding</dt>
            <dd className='font-medium tabular-nums'>
              {formatMoney(outstanding, bill.currency)}
            </dd>
          </div>
        </dl>

        <div className='rounded-md border p-3 text-sm text-muted-foreground'>
          This will simulate payment of the full outstanding balance.
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant='success'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? 'Paying...'
              : `Pay ${formatMoney(outstanding, bill.currency)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
