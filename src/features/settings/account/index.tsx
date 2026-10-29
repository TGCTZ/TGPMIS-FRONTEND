import { ContentSection } from '../components/content-section'
import { PasswordForm } from './password-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Password'
      desc='Change the password you use to sign in.'
    >
      <PasswordForm />
    </ContentSection>
  )
}
