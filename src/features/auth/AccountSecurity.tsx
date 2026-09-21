import { useState, type FormEvent } from 'react'
import { useAuth } from './auth-context'
import { passwordSchema } from './credentials'

export function AccountSecurity() {
  const { upgradeAnonymousAccount } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Enter a valid password.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    const upgradeError = await upgradeAnonymousAccount(result.data)
    setIsSubmitting(false)
    if (upgradeError) setError(upgradeError)
  }

  return (
    <section className="account-security" aria-labelledby="security-heading">
      <h2 id="security-heading">Protect this logbook</h2>
      <p>This account is currently available only on this device. Add a password before you sign out.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="upgrade-password">Password</label>
        <input
          id="upgrade-password"
          name="password"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          onChange={(event) => setPassword(event.target.value)}
          value={password}
          aria-describedby="upgrade-password-help upgrade-password-error"
          aria-invalid={Boolean(error)}
          required
        />
        <span id="upgrade-password-help" className="field-help">At least 12 characters.</span>
        {error && <span id="upgrade-password-error" className="form-error" role="alert">{error}</span>}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving password...' : 'Add password'}
        </button>
      </form>
    </section>
  )
}
