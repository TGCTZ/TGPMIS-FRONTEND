import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { reportSchema } from '../data/schema'
import { FinalizeReportDialog } from './finalize-dialog'

const mocks = vi.hoisted(() => ({
  candidates: vi.fn(),
  stone: vi.fn(),
  finalizeReport: vi.fn(),
}))

vi.mock('../data/api', () => ({
  finalizeReport: mocks.finalizeReport,
  gemmologistCandidatesQuery: () => ({
    queryKey: ['gemmologist-candidates'],
    queryFn: mocks.candidates,
  }),
}))

vi.mock('@/features/stones/data/api', () => ({
  stoneQuery: (id: number) => ({
    queryKey: ['stone', id],
    queryFn: mocks.stone,
  }),
}))

const report = reportSchema.parse({
  id: 1,
  stone: 1,
  report_number: 'TGC-2627-0001',
  species: 3,
  variety: 4,
  color: 5,
  shape_cut: 6,
  stone_weight: '2.500',
  transparency: 'transparent',
  optic_character: 'dr',
  nature_type: 'natural',
  conclusion: 'Natural ruby.',
})

async function renderDialog() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <FinalizeReportDialog open onOpenChange={vi.fn()} currentRow={report} />
    </QueryClientProvider>
  )
}

describe('FinalizeReportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.candidates.mockResolvedValue([{ id: 2, label: 'Second Gemmologist' }])
    mocks.stone.mockResolvedValue({ photo: '/stone.jpg' })
  })

  it('requires choosing an eligible second gemmologist', async () => {
    const screen = await renderDialog()
    const finalize = screen.getByRole('button', {
      name: 'Finalize',
      exact: true,
    })
    const signatory = screen.getByRole('combobox', {
      name: 'Second gemmologist',
    })

    await expect.element(finalize).toBeDisabled()
    await expect.element(signatory).toHaveAttribute('aria-invalid', 'true')
    await userEvent.click(signatory)
    await userEvent.click(
      screen.getByRole('option', { name: 'Second Gemmologist' })
    )
    await expect.element(finalize).toBeEnabled()
    await expect.element(signatory).toHaveAttribute('aria-invalid', 'false')
  })

  it('keeps Finalize unavailable when no second gemmologist is eligible', async () => {
    mocks.candidates.mockResolvedValue([])
    const screen = await renderDialog()

    await expect
      .element(screen.getByText(/No other gemmologist is available/))
      .toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Finalize', exact: true }))
      .toBeDisabled()
  })

  it('keeps Finalize unavailable if the candidate list fails to load', async () => {
    mocks.candidates.mockRejectedValue(new Error('Unavailable'))
    const screen = await renderDialog()

    await expect
      .element(screen.getByText(/list of gemmologists could not be loaded/))
      .toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Finalize', exact: true }))
      .toBeDisabled()
  })
})
