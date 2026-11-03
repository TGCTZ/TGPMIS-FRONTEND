import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { reportSchema } from '../data/schema'
import { ReportMutateDialog } from './mutate-dialog'

vi.mock('@/stores/auth-store', () => {
  type AuthState = { auth: { user: { permissions: string[] } } }
  const authState: AuthState = { auth: { user: { permissions: [] } } }
  return {
    useAuthStore: (select: (state: AuthState) => unknown) => select(authState),
  }
})

vi.mock('@/features/lookups/data/api', () => ({
  lookupOptionsQuery: (resource: string) => ({
    queryKey: ['lookup', resource],
    queryFn: async () => [],
  }),
  createOrGetLookupRow: vi.fn(),
  searchLookupOptions: vi.fn(),
}))

vi.mock('@/features/stones/data/api', () => ({
  stoneQuery: (id: number) => ({
    queryKey: ['stone', id],
    queryFn: async () => ({ photo: null }),
  }),
  setStonePhoto: vi.fn(),
}))

vi.mock('./instruments-panel', () => ({ InstrumentsPanel: () => null }))

const draft = reportSchema.parse({
  id: 1,
  stone: 1,
  report_number: 'TGC-2627-0001',
  is_finalized: false,
})

describe('ReportMutateDialog required outlines', () => {
  it('outlines every unanswered finding and photograph, but not optional comments', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const screen = await render(
      <QueryClientProvider client={client}>
        <ReportMutateDialog open onOpenChange={vi.fn()} currentRow={draft} />
      </QueryClientProvider>
    )

    for (const name of [
      'Specie / Group',
      'Variety',
      'Colour',
      'Shape / cut',
      'Nature',
      'Transparency',
      'Optic character',
    ]) {
      await expect
        .element(screen.getByRole('combobox', { name }))
        .toHaveAttribute('aria-invalid', 'true')
    }
    await expect
      .element(screen.getByRole('spinbutton', { name: 'Weight' }))
      .toHaveAttribute('aria-invalid', 'true')
    await expect
      .element(screen.getByRole('textbox', { name: 'Comments' }))
      .toHaveAttribute('aria-invalid', 'false')
    await expect
      .element(screen.getByRole('group', { name: 'Stone photograph' }))
      .toHaveAttribute('aria-invalid', 'true')
    await expect
      .element(screen.getByRole('group', { name: 'Stone photograph' }))
      .toHaveClass(/border-destructive/)
  })
})
