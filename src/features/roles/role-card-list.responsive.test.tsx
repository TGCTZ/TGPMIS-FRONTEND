import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { type Role } from './data/schema'
import { RoleCardList } from './index'

const role: Role = {
  id: 1,
  name: 'laboratory analyst',
  is_protected: false,
  can_manage: true,
  can_assign: true,
  permissions: ['orders.view_order', 'stones.view_stone'],
  user_count: 3,
}

describe('RoleCardList responsiveness', () => {
  it.each([320, 375, 458, 767])(
    'shows labelled role details without viewport overflow at %i px',
    async (width) => {
      await page.viewport(width, 667)

      const screen = await render(
        <RoleCardList
          roles={[role]}
          isPending={false}
          onView={vi.fn()}
          rowActions={() => []}
        />
      )

      expect(screen.container.querySelector('table')).toBeNull()
      await expect
        .element(
          screen.getByRole('button', { name: 'View role laboratory analyst' })
        )
        .toBeInTheDocument()
      await expect.element(screen.getByText('Permissions')).toBeInTheDocument()
      await expect.element(screen.getByText('Users')).toBeInTheDocument()
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width)
    }
  )
})
