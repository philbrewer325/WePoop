import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getNotifications } from '../features/social/social-api'

function HomeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" /></svg>
}

function ShowdownIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0V3Zm1 10h8v3a4 4 0 0 0 4-4V8h2v4a6 6 0 0 1-5 5.91V21h3v2H4v-2h3v-3.09A6 6 0 0 1 2 12V8h2v4a4 4 0 0 0 4 4v-3Z" /></svg>
}
function ProfileIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 22c.8-4 3.4-6 8-6s7.2 2 8 6" /></svg> }

export function SiteNavigation() {
  const [unread, setUnread] = useState(0)
  useEffect(() => { void getNotifications().then((items) => setUnread(items.filter((item) => !item.read_at).length)).catch(() => undefined) }, [])
  return (
    <nav className="site-navigation" aria-label="Primary navigation">
      <NavLink end to="/" className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}>
        <HomeIcon /><span>Home</span>
      </NavLink>
      <NavLink to="/showdowns" className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}>
        <ShowdownIcon /><span>Showdowns</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}>
        <ProfileIcon /><span>Profile</span>
      </NavLink>
      <NavLink to="/" className="notification-link" aria-label={`${unread} unread notifications`}>
        <span aria-hidden="true">🔔</span>{unread > 0 && <b>{unread}</b>}
      </NavLink>
    </nav>
  )
}
