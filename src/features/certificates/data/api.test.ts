import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCertificatePdf } from './api'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/api', () => ({ api: { get: mocks.get } }))

describe('fetchCertificatePdf', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forwards measured download progress to the caller', async () => {
    mocks.get.mockResolvedValue({ data: new Blob(['pdf']) })
    const onProgress = vi.fn()

    await fetchCertificatePdf(42, onProgress)

    const config = mocks.get.mock.calls[0][1] as {
      onDownloadProgress?: (event: { loaded: number; total?: number }) => void
    }
    config.onDownloadProgress?.({ loaded: 25, total: 100 })

    expect(onProgress).toHaveBeenCalledWith({ loaded: 25, total: 100 })
  })
})
