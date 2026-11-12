import { createStatusBadge, type StatusTone } from '@/components/status-badge'
import { BILL_STATUS_LABELS } from '../data/schema'

/** Money owed reads as a warning; money settled as success. */
const TONES: Record<string, StatusTone> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
  expired: 'danger',
}

/** A bill's payment state. */
export const BillStatusBadge = createStatusBadge(BILL_STATUS_LABELS, TONES)
