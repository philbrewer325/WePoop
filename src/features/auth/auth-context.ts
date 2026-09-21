import { createContext, useContext } from 'react'

export type Profile = { id: string; username: string }
export type AuthStatus = 'loading' | 'ready' | 'configuration-error'
export type AuthContextValue = {
  profile: Profile | null
  status: AuthStatus
  isAnonymous: boolean
  register: (username: string, password: string) => Promise<string | null>
  signIn: (username: string, password: string) => Promise<string | null>
  upgradeAnonymousAccount: (password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
