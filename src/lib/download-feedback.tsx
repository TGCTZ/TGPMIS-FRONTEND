import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

export type DownloadProgressEvent = {
  loaded: number
  total?: number
}

type FeedbackState = {
  visible: boolean
  phase: 'preparing' | 'downloading'
  percent: number | null
}

let nextToastId = 0

/** Delay transient download feedback so fast downloads do not flash. */
export function useDownloadFeedback({ toastProgress = false } = {}) {
  const [state, setState] = useState<FeedbackState>({
    visible: false,
    phase: 'preparing',
    percent: null,
  })
  const stateRef = useRef(state)
  const timerRef = useRef<number | undefined>(undefined)
  const toastIdRef = useRef<string | number | undefined>(undefined)

  const publish = useCallback(
    (next: FeedbackState) => {
      stateRef.current = next
      setState(next)
      if (!toastProgress || !next.visible) return

      const content = (
        <div
          className='w-72 space-y-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-lg'
          role='status'
          aria-live='polite'
        >
          <div className='flex items-center justify-between gap-3 text-sm'>
            <span>
              {next.phase === 'preparing'
                ? 'Preparing download…'
                : 'Downloading…'}
            </span>
            {next.percent !== null && (
              <span className='tabular-nums'>{next.percent}%</span>
            )}
          </div>
          <Progress
            value={next.percent ?? undefined}
            label={
              next.phase === 'preparing'
                ? 'Preparing download'
                : 'Download progress'
            }
          />
        </div>
      )

      if (toastIdRef.current === undefined) {
        toastIdRef.current = `download-progress-${++nextToastId}`
      }
      toast.custom(() => content, {
        id: toastIdRef.current,
        duration: Infinity,
      })
    },
    [toastProgress]
  )

  const start = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    if (toastIdRef.current !== undefined) toast.dismiss(toastIdRef.current)
    toastIdRef.current = undefined
    publish({ visible: false, phase: 'preparing', percent: null })
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined
      publish({ ...stateRef.current, visible: true })
    }, 300)
  }, [publish])

  const report = useCallback(
    ({ loaded, total }: DownloadProgressEvent) => {
      const previous = stateRef.current
      const percent =
        total && total > 0
          ? Math.min(100, Math.round((loaded / total) * 100))
          : null
      const next = { ...previous, phase: 'downloading' as const, percent }
      if (previous.visible) {
        publish(next)
      } else {
        stateRef.current = next
        if (timerRef.current === undefined) {
          timerRef.current = window.setTimeout(() => {
            timerRef.current = undefined
            publish({ ...stateRef.current, visible: true })
          }, 300)
        }
      }
    },
    [publish]
  )

  const finish = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    timerRef.current = undefined
    if (toastIdRef.current !== undefined) toast.dismiss(toastIdRef.current)
    toastIdRef.current = undefined
    publish({ visible: false, phase: 'preparing', percent: null })
  }, [publish])

  return { ...state, start, report, finish }
}
