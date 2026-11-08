import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentPermissions } from '@/lib/authz'
import { useDownloadFeedback } from '@/lib/download-feedback'
import { serverMessageOr } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { brandPanelClassName } from '@/components/layout/brand-panel'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeading } from '@/components/page-heading'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { FilterSelect } from './components/filter-select'
import { ReportPeriodControls } from './components/period-controls'
import { SummaryCards } from './components/summary-cards'
import { downloadHighlights, reportsQuery } from './data/api'
import { canAccessReport, reportConfigs, type ReportKind } from './data/config'
import { defaultPeriod, periodProblem } from './data/period'
import {
  type ReportSearch,
  type ReportSection,
  type ReportHighlightsSearch,
} from './data/schema'

const highlightsRoute = getRouteApi('/_authenticated/reports/highlights/')

export function ReportHighlights() {
  const search = highlightsRoute.useSearch()
  const navigate = highlightsRoute.useNavigate()
  return (
    <ReportHighlightsPage
      search={search}
      permissions={getCurrentPermissions()}
      onChange={(next) => void navigate({ search: next, replace: true })}
    />
  )
}

/** Each report retains its own permission gate, filters, and retry state. */
export function ReportHighlightsPage({
  search,
  permissions,
  onChange,
}: {
  search: ReportHighlightsSearch
  permissions: string[]
  onChange: (search: ReportHighlightsSearch) => void
}) {
  const defaults = defaultPeriod()
  const state = {
    ...search,
    from: search.from ?? defaults.from,
    to: search.to ?? defaults.to,
  }
  const problem = periodProblem(state.from, state.to)
  const financialAllowed = canAccessReport(permissions, 'financial')
  const operationalAllowed = canAccessReport(permissions, 'operational')
  const financialSearch: ReportSearch = {
    from: state.from,
    to: state.to,
    status: state.status,
    page: 1,
    pageSize: 1,
  }
  const operationalSearch: ReportSearch = {
    from: state.from,
    to: state.to,
    stoneType: state.stoneType,
    page: 1,
    pageSize: 1,
  }
  const financialQuery = useQuery({
    ...reportsQuery('financial', financialSearch),
    enabled: financialAllowed && !problem,
  })
  const operationalQuery = useQuery({
    ...reportsQuery('operational', operationalSearch),
    enabled: operationalAllowed && !problem,
  })
  const preferredRangePreset =
    state.rangePreset ?? (!search.from && !search.to ? 'today' : undefined)

  function changeFilters(next: Partial<ReportSearch>) {
    onChange({ ...state, ...next })
  }

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeading
          title='GemID Perfomance Highlights'
          description='Financial and operational report totals for the selected period.'
        />
        <div
          className={`${brandPanelClassName} grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] items-end gap-2 p-3 dark:bg-card dark:text-card-foreground`}
        >
          <ReportPeriodControls
            from={state.from}
            to={state.to}
            preferredRangePreset={preferredRangePreset}
            onChange={changeFilters}
          />
          {financialAllowed &&
            financialQuery.data?.sections.some((section) =>
              ['billing', 'outstanding'].includes(section.key)
            ) && (
              <FilterSelect
                label='Bill status'
                value={state.status}
                choices={[
                  'pending',
                  'partially_paid',
                  'paid',
                  'cancelled',
                  'expired',
                ].map((status) => ({
                  id: status,
                  label: status.replace(/_/g, ' '),
                }))}
                onChange={(value) => changeFilters({ status: value })}
              />
            )}
          {operationalAllowed && (
            <FilterSelect
              label='Stone type'
              value={state.stoneType?.toString()}
              choices={operationalQuery.data?.filters.stone_types ?? []}
              onChange={(value) =>
                changeFilters({ stoneType: value ? Number(value) : undefined })
              }
            />
          )}
        </div>
        {problem ? (
          <Alert variant='destructive'>
            <AlertTitle>Check the date range</AlertTitle>
            <AlertDescription>{problem}</AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-8'>
            {financialAllowed && (
              <SummaryGroup
                kind='financial'
                search={financialSearch}
                sections={financialQuery.data?.sections}
                isPending={financialQuery.isPending}
                isPlaceholderData={financialQuery.isPlaceholderData}
                error={financialQuery.isError ? financialQuery.error : null}
                onRetry={() => void financialQuery.refetch()}
              />
            )}
            {operationalAllowed && (
              <SummaryGroup
                kind='operational'
                search={operationalSearch}
                showDivider={financialAllowed}
                sections={operationalQuery.data?.sections}
                isPending={operationalQuery.isPending}
                isPlaceholderData={operationalQuery.isPlaceholderData}
                error={operationalQuery.isError ? operationalQuery.error : null}
                onRetry={() => void operationalQuery.refetch()}
              />
            )}
          </div>
        )}
      </Main>
    </>
  )
}

function SummaryGroup({
  kind,
  search,
  showDivider = false,
  sections,
  isPending,
  isPlaceholderData,
  error,
  onRetry,
}: {
  kind: ReportKind
  search: ReportSearch
  showDivider?: boolean
  sections?: ReportSection[]
  isPending: boolean
  isPlaceholderData: boolean
  error: Error | null
  onRetry: () => void
}) {
  const [exporting, setExporting] = useState<'xlsx' | 'pdf' | null>(null)
  const feedback = useDownloadFeedback()

  async function exportFile(fileType: 'xlsx' | 'pdf') {
    setExporting(fileType)
    feedback.start()
    try {
      await downloadHighlights(kind, search, fileType, feedback.report)
      toast.success('Highlights download is ready.')
    } catch (downloadError) {
      if (
        downloadError &&
        typeof downloadError === 'object' &&
        'response' in downloadError
      ) {
        const response = (downloadError as { response?: { data?: unknown } })
          .response
        if (response?.data instanceof Blob) {
          try {
            const payload = JSON.parse(await response.data.text()) as {
              detail?: string | string[]
            }
            toast.error(
              Array.isArray(payload.detail)
                ? payload.detail.join(' ')
                : (payload.detail ?? 'Could not download these highlights.')
            )
            return
          } catch {
            // The server can also return a non-JSON error body.
          }
        }
      }
      toast.error(
        serverMessageOr(
          downloadError,
          'Could not download these highlights. Please try again.'
        )
      )
    } finally {
      feedback.finish()
      setExporting(null)
    }
  }

  return (
    <section
      className={
        showDivider ? 'space-y-4 border-t-4 border-gold pt-8' : 'space-y-4'
      }
      aria-label={reportConfigs[kind].title}
    >
      <PageHeading
        title={kind === 'financial' ? 'Financial' : 'Operational'}
        className='p-2 sm:p-3'
      >
        {(['xlsx', 'pdf'] as const).map((fileType) => (
          <Button
            key={fileType}
            variant={fileType === 'xlsx' ? 'success' : 'default'}
            className='relative overflow-hidden'
            aria-label={`Download ${kind} highlights as ${fileType === 'xlsx' ? 'Excel' : 'PDF'}`}
            disabled={
              !sections ||
              isPending ||
              isPlaceholderData ||
              !!error ||
              !!exporting
            }
            onClick={() => void exportFile(fileType)}
          >
            <Download className='size-4' />
            {exporting === fileType && feedback.visible
              ? feedback.phase === 'preparing'
                ? 'Preparing…'
                : feedback.percent === null
                  ? 'Downloading…'
                  : `Downloading ${feedback.percent}%`
              : fileType === 'xlsx'
                ? 'Excel'
                : 'PDF'}
            {exporting === fileType && feedback.visible && (
              <Progress
                value={feedback.percent ?? undefined}
                label={`${kind} highlights ${fileType === 'xlsx' ? 'Excel' : 'PDF'} download progress`}
                className='absolute inset-x-0 bottom-0 h-1 rounded-none'
              />
            )}
          </Button>
        ))}
      </PageHeading>
      {isPlaceholderData && (
        <p role='status' className='text-sm font-medium text-gold'>
          Updating report...
        </p>
      )}
      {error ? (
        <Alert variant='destructive'>
          <AlertTitle>
            Could not load {reportConfigs[kind].title.toLowerCase()}
          </AlertTitle>
          <AlertDescription>
            {serverMessageOr(error, 'Please try again.')}
          </AlertDescription>
          <Button variant='outline' onClick={onRetry}>
            Retry
          </Button>
        </Alert>
      ) : isPending ? (
        <Skeleton className='h-48 w-full' />
      ) : sections ? (
        <SummaryCards kind={kind} sections={sections} />
      ) : null}
    </section>
  )
}
