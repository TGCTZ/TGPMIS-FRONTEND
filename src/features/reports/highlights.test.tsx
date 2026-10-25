import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { PERMISSIONS } from '@/lib/permissions'
import { formatReportBadgeMoney } from './data/format'
import { type ReportHighlightsSearch, type ReportSearch } from './data/schema'
import { ReportHighlightsPage } from './highlights'

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }))

vi.mock('./data/api', () => ({
  reportsQuery: (kind: string, search: ReportSearch) => ({
    queryKey: ['reports', kind, search],
    retry: false,
    queryFn: () => mocks.fetch(kind, search),
  }),
}))
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('@/components/config-drawer', () => ({ ConfigDrawer: () => null }))
vi.mock('@/components/profile-dropdown', () => ({
  ProfileDropdown: () => null,
}))
vi.mock('@/components/search', () => ({ Search: () => null }))
vi.mock('@/components/theme-switch', () => ({ ThemeSwitch: () => null }))

const financialPermissions = [
  PERMISSIONS.moduleReports,
  PERMISSIONS.financialReports,
  'billing.view_bill',
]
const operationalPermissions = [
  PERMISSIONS.moduleReports,
  PERMISSIONS.operationalReports,
  'orders.view_stone',
]

function section(key: string, title: string, overrides = {}) {
  return {
    key,
    title,
    description: `${title} details.`,
    count: 3,
    missing_dates: 0,
    amounts: [],
    statuses: [],
    categories: [],
    varieties: [],
    ...overrides,
  }
}

const financialData = {
  sections: [
    section('billing', 'Billing summary', {
      amounts: [{ currency: 'TZS', amount: '300.00' }],
      statuses: [{ status: 'paid', count: 2 }],
      missing_dates: 1,
    }),
    section('outstanding', 'Outstanding bills'),
  ],
  filters: { stone_types: [] },
}
const operationalData = {
  sections: [
    section('orders', 'Orders received'),
    section('stones', 'Stones registered', {
      categories: [
        {
          name: 'Precious',
          count: 3,
          amounts: [{ currency: 'TZS', amount: '120.00' }],
        },
        {
          name: 'TestCategory',
          count: 2,
          amounts: [{ currency: 'TZS', amount: '600.00' }],
        },
      ],
    }),
    section('certificates', 'Certificates issued', {
      varieties: [
        {
          name: 'Ruby',
          count: 2,
          amounts: [{ currency: 'TZS', amount: '90.00' }],
        },
      ],
    }),
  ],
  filters: { stone_types: [{ id: 7, label: 'Ruby' }] },
}

async function renderPage(
  permissions: string[],
  search: ReportHighlightsSearch = {
    from: '2026-09-01',
    to: '2026-09-30',
  }
) {
  const onChange = vi.fn()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const screen = await render(
    <QueryClientProvider client={client}>
      <ReportHighlightsPage
        search={search}
        permissions={permissions}
        onChange={onChange}
      />
    </QueryClientProvider>
  )
  return { screen, onChange }
}

describe('report Highlights page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.fetch.mockImplementation((kind: string) =>
      Promise.resolve(kind === 'financial' ? financialData : operationalData)
    )
  })

  it('shows both groups, preserves summary content, and has no downloads', async () => {
    const { screen } = await renderPage([
      ...financialPermissions,
      ...operationalPermissions,
    ])
    await expect
      .element(screen.getByText('GemID Perfomance Highlights'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('heading', { name: 'Financial reports' }))
      .not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('heading', { name: 'Operational reports' }))
      .not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('region', { name: 'Operational reports' }))
      .toHaveClass(/border-t-4/, /border-gold/)
    for (const title of [
      'Billing summary',
      'Outstanding bills',
      'Orders received',
      'Stones registered',
      'Certificates issued',
    ]) {
      await expect.element(screen.getByText(title)).toBeInTheDocument()
    }
    await expect
      .element(screen.getByText(formatReportBadgeMoney(300, 'TZS')))
      .toHaveClass(/bg-emerald-100/)
    await expect.element(screen.getByText('paid: 2')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Records without an event date'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Stone categories'))
      .toBeInTheDocument()
    await expect.element(screen.getByText('Precious')).toBeInTheDocument()
    await expect
      .element(screen.getByText('TestCategory', { exact: true }))
      .not.toBeInTheDocument()
    await expect.element(screen.getByText('Varieties')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Ruby', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Amount (TZS)', { exact: true }).first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Excel' }))
      .not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'PDF' }))
      .not.toBeInTheDocument()
    expect(mocks.fetch).toHaveBeenCalledWith(
      'financial',
      expect.objectContaining({
        from: '2026-09-01',
        to: '2026-09-30',
        pageSize: 1,
      })
    )
    expect(mocks.fetch).toHaveBeenCalledWith(
      'operational',
      expect.objectContaining({
        from: '2026-09-01',
        to: '2026-09-30',
        pageSize: 1,
      })
    )
  })

  it('sends Bill status and Stone type only to their own report APIs', async () => {
    const { screen, onChange } = await renderPage(
      [...financialPermissions, ...operationalPermissions],
      {
        from: '2026-09-01',
        to: '2026-09-30',
        status: 'paid',
        stoneType: 7,
      }
    )
    await expect
      .element(screen.getByText('Billing summary'))
      .toBeInTheDocument()
    expect(mocks.fetch).toHaveBeenCalledWith(
      'financial',
      expect.objectContaining({ status: 'paid' })
    )
    expect(mocks.fetch).toHaveBeenCalledWith(
      'operational',
      expect.objectContaining({ stoneType: 7 })
    )
    const financialSearch = mocks.fetch.mock.calls.find(
      ([kind]) => kind === 'financial'
    )?.[1] as ReportSearch
    const operationalSearch = mocks.fetch.mock.calls.find(
      ([kind]) => kind === 'operational'
    )?.[1] as ReportSearch
    expect(financialSearch.stoneType).toBeUndefined()
    expect(operationalSearch.status).toBeUndefined()
    await screen.getByLabelText('From').fill('2026-08-01')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '2026-08-01',
        to: '2026-09-30',
        status: 'paid',
        stoneType: 7,
      })
    )
  })

  it('requests only the financial report for a financial-only user', async () => {
    const { screen } = await renderPage(financialPermissions)
    await expect
      .element(screen.getByText('Billing summary'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Stones registered'))
      .not.toBeInTheDocument()
    expect(mocks.fetch.mock.calls.map(([kind]) => kind)).toEqual(['financial'])
  })

  it('requests only the operational report for an operational-only user', async () => {
    const { screen } = await renderPage(operationalPermissions)
    await expect
      .element(screen.getByText('Stones registered'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Billing summary'))
      .not.toBeInTheDocument()
    expect(mocks.fetch.mock.calls.map(([kind]) => kind)).toEqual([
      'operational',
    ])
  })

  it('makes no report request without either report permission', async () => {
    await renderPage([])
    expect(mocks.fetch).not.toHaveBeenCalled()
  })

  it('keeps operational cards visible if the financial request fails', async () => {
    mocks.fetch.mockImplementation((kind: string) =>
      kind === 'financial'
        ? Promise.reject(new Error('Financial unavailable'))
        : Promise.resolve(operationalData)
    )
    const { screen } = await renderPage([
      ...financialPermissions,
      ...operationalPermissions,
    ])
    await expect
      .element(screen.getByText('Could not load financial reports'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Stones registered'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Retry' }))
      .toBeInTheDocument()
  })
})
