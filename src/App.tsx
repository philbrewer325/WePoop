import { AuthProvider } from './features/auth/AuthProvider'
import { useAuth } from './features/auth/auth-context'
import { AccountSecurity } from './features/auth/AccountSecurity'
import { OnboardingScreen } from './features/auth/OnboardingScreen'
import { PoopDashboard } from './features/poops/PoopDashboard'
import { SocialPanel } from './features/social/SocialPanel'
import { FriendFeed } from './features/feed/FriendFeed'
import { ShowdownPanel } from './features/showdowns/ShowdownPanel'
import { Brand } from './components/Brand'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'

function AppHeader({ canSignOut, onSignOut }: { canSignOut: boolean; onSignOut: () => void }) {
  return <header className="topbar">
    <Link className="brand" to="/" aria-label="WePoop home"><Brand /></Link>
    <nav className="main-nav" aria-label="Main navigation">
      <Link to="/">Home</Link>
      <Link to="/showdowns">Showdowns</Link>
    </nav>
    {canSignOut && <button className="text-button" type="button" onClick={onSignOut}>Sign out</button>}
  </header>
}

function AppContent() {
  const { isAnonymous, profile, signOut, status } = useAuth()

  if (status === 'loading') {
    return <main className="status-screen">Loading your logbook...</main>
  }

  if (status === 'configuration-error') {
    return (
      <main className="status-screen">
        <h1>WePoop needs configuration</h1>
        <p>Set the Supabase URL and publishable key before running the app.</p>
      </main>
    )
  }

  if (!profile) {
    return <OnboardingScreen />
  }

  const header = <AppHeader canSignOut={!isAnonymous} onSignOut={() => void signOut()} />
  return <Routes>
    <Route path="/" element={<main className="app-shell">{header}<section className="dashboard" aria-labelledby="welcome-heading"><p className="eyebrow">Your friendly logbook</p><h1 id="welcome-heading">Hi, {profile.username}</h1><p className="lead">Keep the streak moving.</p>{isAnonymous && <AccountSecurity />}<PoopDashboard /><SocialPanel /><FriendFeed /></section></main>} />
    <Route path="/showdowns" element={<main className="app-shell">{header}<section className="dashboard showdown-page"><p className="eyebrow">Private competition</p><h1>Your Showdowns</h1><p className="lead">Create a weekly challenge, invite friends, and follow the standings.</p><ShowdownPanel /></section></main>} />
    <Route path="*" element={<Navigate replace to="/" />} />
  </Routes>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter><AppContent /></BrowserRouter>
    </AuthProvider>
  )
}

export default App
