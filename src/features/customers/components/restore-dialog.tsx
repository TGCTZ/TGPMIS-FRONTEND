import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { restoreCustomer } from '../data/api'
import { type Customer } from '../data/schema'

type CustomerRestoreDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Customer
}

export function CustomerRestoreDialog({
  open,
  onOpenChange,
  currentRow,
}: CustomerRestoreDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreCustomer(currentRow.id),
    onSuccess: () => {
      toast.success(
        <>
          Restored <span className='uppercase'>{currentRow.full_name}</span>
        </>
      )
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer-options'] })
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 403) {
        toast.error('You do not have permission to restore customers.')
        return
      }

      toast.error('Could not restore the customer. Please try again.')
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Restore customer'
      desc={
        <>
          Restore <span className='uppercase'>{currentRow.full_name}</span>?
        </>
      }
      confirmText={mutation.isPending ? 'Restoring...' : 'Restore'}
      disabled={mutation.isPending}
      handleConfirm={() => mutation.mutate()}
      className='sm:max-w-sm'
    />
  )
}
