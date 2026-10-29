import { ContentSection } from '../components/content-section'
import { PasswordForm } from './password-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Password'
      desc='Change the password you use to sign in.'
    >
      <div className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Changing your password signs out every other device.
        </p>
        <PasswordForm />
      </div>
    </ContentSection>
  )
}
