import { api } from '@/lib/api'
import { type DownloadProgressEvent } from '@/lib/download-feedback'

/**
 * Fetch one certificate's PDF.
 *
 * Deliberately unparsed: the Zod-at-the-boundary rule guards JSON shapes, and a
 * PDF has none. `responseType: 'blob'` is what stops axios decoding the bytes
 * as text and corrupting them.
 */
export async function fetchCertificatePdf(
  id: number,
  onProgress?: (progress: DownloadProgressEvent) => void
): Promise<Blob> {
  const res = await api.get(`/certificates/${id}/pdf`, {
    responseType: 'blob',
    onDownloadProgress: onProgress
      ? (event) => onProgress({ loaded: event.loaded, total: event.total })
      : undefined,
  })
  return res.data as Blob
}
