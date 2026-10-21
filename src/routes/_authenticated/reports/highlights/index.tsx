import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentPermissions } from '@/lib/authz'
import { canAccessHighlights } from '@/features/reports/data/config'
import { reportHighlightsSearchSchema } from '@/features/reports/data/schema'
import { ReportHighlights } from '@/features/reports/highlights'

export const Route = createFileRoute('/_authenticated/reports/highlights/')({
  beforeLoad: () => {
    const permissions = getCurrentPermissions()
    if (!canAccessHighlights(permissions)) {
      throw redirect({ to: '/403' })
    }
  },
  validateSearch: reportHighlightsSearchSchema,
  component: ReportHighlights,
})
