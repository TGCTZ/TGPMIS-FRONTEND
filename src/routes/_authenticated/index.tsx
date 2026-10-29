import { createFileRoute, redirect } from '@tanstack/react-router'
import { landingPath } from '@/features/auth/data/landing'
import {
  legacyPeriod,
  legacySearchSchema,
} from '@/features/reports/data/period'

export const Route = createFileRoute('/_authenticated/')({
  validateSearch: legacySearchSchema,
  beforeLoad: ({ search }) => {
    const to = landingPath()
    throw redirect({
      to,
      search:
        search.from || search.to || search.range ? legacyPeriod(search) : {},
    })
  },
})
