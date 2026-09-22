import { useEffect, useState, type FormEvent } from 'react'
import { authEmailForUsername } from '../auth/credentials'
import { usernameSchema } from '../auth/username'
import { supabase } from '../../lib/supabase'

type Stats = { username: string; lifetime_count: number; week_count: number; showdowns_participated: number; showdown_wins: number }

export function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => { if (supabase) void supabase.rpc('get_my_profile_stats').then(({ data }) => { setStats(data?.[0] ?? null); setUsername(data?.[0]?.username ?? '') }) }, [])
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return
    const parsed = usernameSchema.safeParse(username)
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Enter a valid username.'); return }
    const { error: authError } = await supabase.auth.updateUser({ email: authEmailForUsername(parsed.data) })
    if (authError) { setMessage(authError.message); return }
    const { error } = await supabase.rpc('update_my_username', { p_username: parsed.data })
    setMessage(error ? error.message : 'Username updated. Use it next time you sign in.')
    if (!error && stats) setStats({ ...stats, username: parsed.data })
  }
  return <section className="profile-page"><p className="eyebrow">Your account</p><h1>Profile</h1>{stats && <><h2>@{stats.username}</h2><div className="metric-grid profile-stats"><article className="metric-card"><span>All time</span><strong>{stats.lifetime_count}</strong><p>logs</p></article><article className="metric-card"><span>This week</span><strong>{stats.week_count}</strong><p>logs</p></article><article className="metric-card"><span>Showdowns</span><strong>{stats.showdowns_participated}</strong><p>joined</p></article><article className="metric-card"><span>Wins</span><strong>{stats.showdown_wins}</strong><p>completed</p></article></div></>}<form className="showdown-form profile-form" onSubmit={save}><label>Username<input value={username} maxLength={20} onChange={(e) => setUsername(e.target.value)} /></label><button className="primary-button" type="submit">Update username</button></form>{message && <p className="hint">{message}</p>}</section>
}
