import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { Progress } from '@/components/ui/progress'
import { useDownloadFeedback } from './download-feedback'

const toastMocks = vi.hoisted(() => ({ custom: vi.fn(), dismiss: vi.fn() }))

vi.mock('sonner', () => ({ toast: toastMocks }))

function FeedbackHarness() {
  const feedback = useDownloadFeedback({ toastProgress: true })

  return (
    <div>
      <button onClick={feedback.start}>Start</button>
      <button onClick={() => feedback.report({ loaded: 20 })}>
        Unknown size
      </button>
      <button onClick={() => feedback.report({ loaded: 20, total: 100 })}>
        Known size
      </button>
      <button onClick={feedback.finish}>Finish</button>
      {feedback.visible && (
        <>
          <span>
            {feedback.phase === 'preparing'
              ? 'Preparing download…'
              : 'Downloading…'}
          </span>
          <Progress
            value={feedback.percent ?? undefined}
            label='Download progress'
          />
        </>
      )}
    </div>
  )
}

describe('download feedback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('delays progress and supports indeterminate and measured toast states', async () => {
    const screen = await render(<FeedbackHarness />)

    await page.getByRole('button', { name: 'Start' }).click()
    await expect
      .element(screen.getByRole('progressbar', { name: 'Download progress' }))
      .not.toBeInTheDocument()

    await new Promise((resolve) => window.setTimeout(resolve, 350))
    await expect
      .element(screen.getByText('Preparing download…'))
      .toBeInTheDocument()
    await page
      .getByRole('button', { name: 'Unknown size', exact: true })
      .click()
    await expect.element(screen.getByText('Downloading…')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('progressbar', { name: 'Download progress' }))
      .not.toHaveAttribute('aria-valuenow')
    expect(toastMocks.custom).toHaveBeenCalled()

    await page.getByRole('button', { name: 'Known size', exact: true }).click()
    await expect
      .element(screen.getByRole('progressbar', { name: 'Download progress' }))
      .toHaveAttribute('aria-valuenow', '20')

    await page.getByRole('button', { name: 'Finish' }).click()
    await expect
      .element(screen.getByRole('progressbar', { name: 'Download progress' }))
      .not.toBeInTheDocument()
    expect(toastMocks.dismiss).toHaveBeenCalled()
  })
})
