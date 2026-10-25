import { useEffect, useState } from 'react'
import { DataTableRowActions } from '@/components/data-table'
import { type Order } from '../data/schema'
import { useOrderActions } from '../hooks/use-actions'

export function OrdersRowActions({ order }: { order: Order }) {
  const [reachedDeadline, setReachedDeadline] = useState<string | null>(null)

  useEffect(() => {
    const availableAt = order.copy_available_at
    if (!availableAt || order.control_number || order.deleted_at) return

    const delay = Date.parse(availableAt) - Date.now()
    const timer = window.setTimeout(
      () => setReachedDeadline(availableAt),
      Math.max(0, delay)
    )
    return () => window.clearTimeout(timer)
  }, [order.copy_available_at, order.control_number, order.deleted_at])

  return (
    <DataTableRowActions
      actions={useOrderActions(
        order,
        reachedDeadline === order.copy_available_at
      )}
    />
  )
}
