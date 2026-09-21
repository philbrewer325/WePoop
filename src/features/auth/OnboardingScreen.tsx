import { useState, type FormEvent } from 'react'
import { Brand } from '../../components/Brand'
import { useAuth } from './auth-context'
import { passwordSchema } from './credentials'
import { usernameSchema } from './username'

type Mode = 'sign-in' | 'create-account'

export function OnboardingScreen() {
  const { register, signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isCreating = mode === 'create-account'

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const usernameResult = usernameSchema.safeParse(username)
    const passwordResult = passwordSchema.safeParse(password)
    if (!usernameResult.success) {
      setError(usernameResult.error.issues[0]?.message ?? 'Enter a valid username.')
      return
    }
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0]?.message ?? 'Enter a valid password.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    const authError = isCreating
      ? await register(usernameResult.data, passwordResult.data)
      : await signIn(usernameResult.data, passwordResult.data)
    setIsSubmitting(false)
    if (authError) setError(authError)
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card" aria-labelledby="welcome-heading">
        <div className="auth-brand">
          <Brand />
        </div>
        <p className="eyebrow">The social tracker for friendly logs</p>
        <h1 id="welcome-heading">{isCreating ? 'Create your logbook.' : 'Welcome back.'}</h1>
        <p className="lead">
          {isCreating
            ? 'Choose a username and password. We never ask for your email.'
            : 'Sign in with the username and password you chose.'}
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            maxLength={20}
            onChange={(event) => setUsername(event.target.value)}
            value={username}
            aria-describedby="username-help username-error"
            aria-invalid={Boolean(error)}
            required
          />
          <span id="username-help" className="field-help">3–20 letters, numbers, underscores, or hyphens.</span>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isCreating ? 'new-password' : 'current-password'}
            maxLength={72}
            onChange={(event) => setPassword(event.target.value)}
            value={password}
            aria-describedby="password-help username-error"
            aria-invalid={Boolean(error)}
            required
          />
          <span id="password-help" className="field-help">At least 12 characters.</span>
          {error && <span id="username-error" className="form-error" role="alert">{error}</span>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : isCreating ? 'Create my logbook' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isCreating ? 'Already have an account?' : 'New to WePoop?'}
          <button className="text-button" type="button" onClick={() => switchMode(isCreating ? 'sign-in' : 'create-account')}>
            {isCreating ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  )
}
