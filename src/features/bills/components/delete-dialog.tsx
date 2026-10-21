import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serverMessageOr } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteBill } from '../data/api'
import { type Bill } from '../data/schema'

type BillDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill
}

export function BillDeleteDialog({
  open,
  onOpenChange,
  bill,
}: BillDeleteDialogProps) {
  const queryClient = useQueryClient()
  const requiresGePGCancellation =
    Boolean(bill.control_number) || bill.is_gepg_submitted

  const mutation = useMutation({
    mutationFn: () => deleteBill(bill.id),
    onSuccess: async () => {
      toast.success(`Deleted ${bill.bill_number}`, {
        description: 'The bill and its items were removed from active lists.',
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['workflow-feed'] }),
      ])
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('You do not have permission to delete bills.')
        return
      }
      toast.error(
        serverMessageOr(error, 'Could not delete the bill. Please try again.')
      )
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Delete bill'
      desc={
        <div className='space-y-2'>
          <p>
            Delete {bill.bill_number} and remove its bill items from active
            lists? The order and stones will remain.
          </p>
          {requiresGePGCancellation ? (
            <p>
              This bill has a GePG control number or submission. The server will
              cancel it with GePG first; the bill stays active if GePG does not
              confirm cancellation.
            </p>
          ) : (
            <p>The bill and its items will be kept in the audit history.</p>
          )}
        </div>
      }
      confirmText={mutation.isPending ? 'Deleting...' : 'Delete bill'}
      destructive
      disabled={mutation.isPending}
      handleConfirm={() => mutation.mutate()}
      className='sm:max-w-md'
    />
  )
}
