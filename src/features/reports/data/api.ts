import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toPaginated } from '@/lib/api-query'
import { formatDateInput } from '@/lib/date'
import { saveBlob } from '@/lib/download'
import { type DownloadProgressEvent } from '@/lib/download-feedback'
import { type ReportKind } from './config'
import { reportResultSchema, type ReportSearch } from './schema'

function reportParams(search: ReportSearch) {
  return {
    from_date: search.from,
    to_date: search.to,
    section: search.section,
    status: search.status,
    search: search.search,
    stone_type: search.stoneType,
    page: search.page,
    page_size: search.pageSize,
  }
}

function reportFilenamePeriod(search: ReportSearch): string {
  if (search.search?.trim()) return 'all-dates'

  const from = search.from
    ? formatDateInput(search.from).replace(/\//g, '-')
    : undefined
  const to = search.to
    ? formatDateInput(search.to).replace(/\//g, '-')
    : undefined
  return from && to ? `${from}-${to}` : 'current-period'
}

/** Parse every API response before passing it to the shared table components. */
export const reportsQuery = (kind: ReportKind, search: ReportSearch) =>
  queryOptions({
    queryKey: ['reports', kind, search],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get(`/reports/${kind}`, {
        params: reportParams(search),
      })
      const data = reportResultSchema.parse(response.data)
      return {
        ...data,
        page: toPaginated(data, {
          page: search.page,
          perPage: search.pageSize,
        }),
      }
    },
  })

/** The server exports every matching section, not merely the table's visible page. */
export async function downloadReport(
  kind: ReportKind,
  search: ReportSearch,
  fileType: 'xlsx' | 'pdf',
  onProgress?: (progress: DownloadProgressEvent) => void
) {
  const response = await api.get(`/reports/${kind}/export`, {
    params: { ...reportParams(search), file_type: fileType },
    responseType: 'blob',
    onDownloadProgress: onProgress
      ? (event) => onProgress({ loaded: event.loaded, total: event.total })
      : undefined,
  })
  const period = reportFilenamePeriod(search)
  saveBlob(response.data as Blob, `${kind}-reports-${period}.${fileType}`)
}

/** Download the totals shown on one highlights group, without detail rows. */
export async function downloadHighlights(
  kind: ReportKind,
  search: ReportSearch,
  fileType: 'xlsx' | 'pdf',
  onProgress?: (progress: DownloadProgressEvent) => void
) {
  const response = await api.get(`/reports/${kind}/highlights/export`, {
    params: { ...reportParams(search), file_type: fileType },
    responseType: 'blob',
    onDownloadProgress: onProgress
      ? (event) => onProgress({ loaded: event.loaded, total: event.total })
      : undefined,
  })
  saveBlob(
    response.data as Blob,
    `${kind}-highlights-${reportFilenamePeriod(search)}.${fileType}`
  )
}
