import { createFileRoute } from '@tanstack/react-router'
import { reportHighlightsSearchSchema } from '@/features/reports/data/schema'
import { ReportHighlights } from '@/features/reports/highlights'

export const Route = createFileRoute('/_authenticated/reports/highlights/')({
  validateSearch: reportHighlightsSearchSchema,
  component: ReportHighlights,
})
