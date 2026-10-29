import { Outlet } from '@tanstack/react-router'
import { KeyRound, UserCog } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeading } from '@/components/page-heading'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Password',
    href: '/settings/account',
    icon: <KeyRound size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeading
          title='Settings'
          description='View your profile details and change your password.'
        />
        <div className='flex min-w-0 flex-col gap-4'>
          <SidebarNav items={sidebarNavItems} />
          <div className='min-w-0'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
