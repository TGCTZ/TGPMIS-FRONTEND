import { type ColumnDef } from '@tanstack/react-table'
import { regionLabel } from '@/lib/regions'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/status-badge'
import { type Customer } from '../data/schema'
import { CustomersRowActions } from './row-actions'

/** Em dash for a blank optional field, so the column never collapses. */
function orDash(value: string | null | undefined) {
  return value ? value : <span className='text-muted-foreground'>—</span>
}

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'first_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div className='min-w-0 md:min-w-44'>
        <div className='flex items-center gap-2'>
          <LongText className='max-w-48 font-medium uppercase'>
            {row.original.full_name}
          </LongText>
          {row.original.deleted_at && (
            <StatusBadge tone='danger'>Deleted</StatusBadge>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone number' />
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <LongText className='max-w-40'>{row.original.phone}</LongText>
    ),
  },
  {
    accessorKey: 'region',
    meta: { align: 'center' },
    header: () => <span>Region</span>,
    enableSorting: false,
    cell: ({ row }) => orDash(regionLabel(row.original.region)),
  },
  {
    id: 'actions',
    meta: { align: 'center' },
    cell: ({ row }) => <CustomersRowActions customer={row.original} />,
  },
]
