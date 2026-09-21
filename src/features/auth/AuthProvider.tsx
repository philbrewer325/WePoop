import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthContext, type AuthStatus, type Profile } from './auth-context'
import { messageForAuthError } from './auth-errors'
import { authEmailForUsername, passwordSchema } from './credentials'
import { usernameSchema } from './username'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'loading' : 'configuration-error')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!supabase || !session) {
      setProfile(null)
      setIsAnonymous(false)
      setStatus('ready')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('Unable to load the authenticated profile.', error)
      setProfile(null)
    } else {
      setProfile(data)
    }
    setIsAnonymous(session.user.is_anonymous === true)
    setStatus('ready')
  }, [])

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Unable to restore the authenticated session.', error)
      void loadProfile(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const register = useCallback(async (rawUsername: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.'
    const parsedUsername = usernameSchema.safeParse(rawUsername)
    if (!parsedUsername.success) return parsedUsername.error.issues[0]?.message ?? 'Enter a valid username.'
    const parsedPassword = passwordSchema.safeParse(password)
    if (!parsedPassword.success) return parsedPassword.error.issues[0]?.message ?? 'Enter a valid password.'

    const { data, error } = await supabase.auth.signUp({
      email: authEmailForUsername(parsedUsername.data),
      password: parsedPassword.data,
      options: { data: { username: parsedUsername.data } },
    })
    if (error) return messageForAuthError(error.message)
    if (data.user?.identities?.length === 0) return 'That username is already taken.'
    if (!data.session) return 'Account confirmation is misconfigured. Disable Confirm email in Supabase Auth settings.'
    return null
  }, [])

  const signIn = useCallback(async (rawUsername: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.'
    const parsedUsername = usernameSchema.safeParse(rawUsername)
    if (!parsedUsername.success) return parsedUsername.error.issues[0]?.message ?? 'Enter a valid username.'
    const parsedPassword = passwordSchema.safeParse(password)
    if (!parsedPassword.success) return parsedPassword.error.issues[0]?.message ?? 'Enter a valid password.'

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmailForUsername(parsedUsername.data),
      password: parsedPassword.data,
    })
    return error ? messageForAuthError(error.message) : null
  }, [])

  const upgradeAnonymousAccount = useCallback(async (password: string) => {
    if (!supabase || !profile) return 'Your account session is unavailable.'
    const parsedPassword = passwordSchema.safeParse(password)
    if (!parsedPassword.success) return parsedPassword.error.issues[0]?.message ?? 'Enter a valid password.'

    const { error: emailError } = await supabase.auth.updateUser({
      email: authEmailForUsername(profile.username),
    })
    if (emailError) return messageForAuthError(emailError.message)

    const { error: passwordError } = await supabase.auth.updateUser({
      password: parsedPassword.data,
    })
    return passwordError ? messageForAuthError(passwordError.message) : null
  }, [profile])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Unable to sign out.', error)
  }, [])

  const value = useMemo(
    () => ({ profile, status, isAnonymous, register, signIn, upgradeAnonymousAccount, signOut }),
    [profile, status, isAnonymous, register, signIn, upgradeAnonymousAccount, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
