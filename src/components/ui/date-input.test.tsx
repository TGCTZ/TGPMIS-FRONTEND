import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { DateInput } from './date-input'

describe('DateInput', () => {
  it('shows an ISO value in dd/mm/yyyy format', async () => {
    const { getByRole } = await render(
      <DateInput
        aria-label='Received date'
        value='2026-10-30'
        onChange={vi.fn()}
      />
    )

    await expect
      .element(getByRole('textbox', { name: 'Received date' }))
      .toHaveValue('30/10/2026')
  })

  it('selects from the calendar and emits the API date value', async () => {
    const onChange = vi.fn()
    const { getByRole } = await render(
      <DateInput
        aria-label='Received date'
        value='2026-10-30'
        onChange={onChange}
      />
    )

    await userEvent.click(getByRole('button', { name: 'Choose date' }))
    await userEvent.click(getByRole('button', { name: 'Next month' }))
    await userEvent.click(getByRole('button', { name: '04/11/2026' }))

    await expect
      .element(getByRole('textbox', { name: 'Received date' }))
      .toHaveValue('04/11/2026')
    expect(onChange).toHaveBeenLastCalledWith('2026-11-04')
  })
})
