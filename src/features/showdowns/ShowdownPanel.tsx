import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { getFriends, type Friend } from '../social/social-api'

type Showdown = { id: string; name: string; description: string | null; start_at: string; end_at: string; status: string; max_participants: number; participant_count?: number }

function formatDateTimeLocal(value: Date) {
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

function weeklyDefaults() {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start: formatDateTimeLocal(start), end: formatDateTimeLocal(end) }
}

export function ShowdownPanel() {
  const defaults = weeklyDefaults()
  const [showdowns, setShowdowns] = useState<Showdown[]>([])
  const [myShowdowns, setMyShowdowns] = useState<Showdown[]>([])
  const [leaderboard, setLeaderboard] = useState<{ rank: number; username: string; poop_count: number; difference_from_leader: number }[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [invitations, setInvitations] = useState<{ id: string; showdown_name: string; inviter_username: string }[]>([])
  const [invitees, setInvitees] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState(defaults.start)
  const [end, setEnd] = useState(defaults.end)
  const [editing, setEditing] = useState<Showdown | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    if (!supabase) return
    const { data, error: loadError } = await supabase.rpc('list_my_private_showdowns')
    if (loadError) throw loadError
    setShowdowns(data ?? [])
    const { data: joined, error: joinedError } = await supabase.rpc('list_user_showdowns')
    if (joinedError) throw joinedError
    setMyShowdowns(joined ?? [])
    const [nextFriends, invitationResult] = await Promise.all([
      getFriends(),
      supabase.rpc('list_showdown_invitations'),
    ])
    if (invitationResult.error) throw invitationResult.error
    setFriends(nextFriends); setInvitations(invitationResult.data ?? [])
  }

  async function viewLeaderboard(id: string) {
    if (!supabase) return
    const { data, error: leaderboardError } = await supabase.rpc('get_showdown_leaderboard', { p_showdown_id: id })
    if (leaderboardError) { setError(leaderboardError.message); return }
    setLeaderboard(data ?? [])
  }

  useEffect(() => { void refresh().catch((loadError: { message?: string }) => setError(loadError.message ?? 'Unable to load Showdowns.')) }, [])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setSaving(true); setError(null)
    const { error: createError } = editing
      ? await supabase.rpc('update_private_showdown', {
          p_showdown_id: editing.id, p_name: name, p_description: description,
          p_start_at: new Date(start).toISOString(), p_end_at: new Date(end).toISOString(), p_max_participants: 20,
        })
      : await supabase.rpc('create_private_showdown', {
          p_name: name, p_description: description,
          p_start_at: new Date(start).toISOString(), p_end_at: new Date(end).toISOString(), p_max_participants: 20,
        })
    setSaving(false)
    if (createError) { setError(createError.message); return }
    setName(''); setDescription(''); setEditing(null)
    await refresh()
  }

  function edit(showdown: Showdown) {
    setEditing(showdown)
    setName(showdown.name)
    setDescription(showdown.description ?? '')
    setStart(formatDateTimeLocal(new Date(showdown.start_at)))
    setEnd(formatDateTimeLocal(new Date(showdown.end_at)))
  }

  async function cancel(id: string) {
    if (!supabase) return
    setSaving(true); setError(null)
    const { error: cancelError } = await supabase.rpc('cancel_private_showdown', { p_showdown_id: id })
    setSaving(false)
    if (cancelError) { setError(cancelError.message); return }
    await refresh()
  }

  async function invite(showdownId: string) {
    if (!supabase || !invitees[showdownId]) return
    setSaving(true); setError(null)
    const { error: inviteError } = await supabase.rpc('invite_to_private_showdown', { p_showdown_id: showdownId, p_invitee_id: invitees[showdownId] })
    setSaving(false)
    if (inviteError) setError(inviteError.message)
  }

  async function respond(invitationId: string, accept: boolean) {
    if (!supabase) return
    setSaving(true); setError(null)
    const { error: responseError } = await supabase.rpc('respond_to_showdown_invitation', { p_invitation_id: invitationId, p_accept: accept })
    setSaving(false)
    if (responseError) { setError(responseError.message); return }
    await refresh()
  }

  return <section className="showdown-panel" aria-labelledby="showdowns-heading">
    <p className="eyebrow">Private competition</p><h2 id="showdowns-heading">{editing ? 'Edit Showdown' : 'Weekly Showdowns'}</h2>
    <form className="showdown-form" onSubmit={create}>
      <label>Name<input required minLength={3} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekend Warriors" /></label>
      <label>Description (optional)<input maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A friendly seven-day race" /></label>
      <div className="showdown-dates"><label>Starts<input type="datetime-local" required value={start} onChange={(event) => setStart(event.target.value)} /></label><label>Ends<input type="datetime-local" required value={end} onChange={(event) => setEnd(event.target.value)} /></label></div>
      <button className="primary-button" disabled={saving} type="submit">{saving ? 'Saving...' : editing ? 'Save changes' : 'Create private Showdown'}</button>
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    <ul className="showdown-list">{showdowns.map((showdown) => <li key={showdown.id}><div><strong>{showdown.name}</strong><span>{showdown.status} · starts {new Date(showdown.start_at).toLocaleDateString()}</span>{['scheduled', 'active'].includes(showdown.status) && friends.length > 0 && <div className="invite-row"><select value={invitees[showdown.id] ?? ''} onChange={(event) => setInvitees({ ...invitees, [showdown.id]: event.target.value })}><option value="">Invite a friend</option>{friends.map((friend) => <option key={friend.id} value={friend.id}>@{friend.username}</option>)}</select><button className="text-button" disabled={saving || !invitees[showdown.id]} onClick={() => void invite(showdown.id)} type="button">Invite</button></div>}</div><div className="showdown-actions">{['scheduled', 'draft'].includes(showdown.status) && <button className="text-button" disabled={saving} onClick={() => edit(showdown)} type="button">Edit</button>}{['scheduled', 'active', 'draft'].includes(showdown.status) && <button className="text-button" disabled={saving} onClick={() => void cancel(showdown.id)} type="button">Cancel</button>}</div></li>)}</ul>
    {invitations.length > 0 && <ul className="showdown-list">{invitations.map((invitation) => <li key={invitation.id}><div><strong>{invitation.showdown_name}</strong><span>@{invitation.inviter_username} invited you</span></div><div className="showdown-actions"><button className="secondary-button" disabled={saving} onClick={() => void respond(invitation.id, true)} type="button">Accept</button><button className="text-button" disabled={saving} onClick={() => void respond(invitation.id, false)} type="button">Decline</button></div></li>)}</ul>}
    <h3 className="my-showdowns-heading">My Showdowns</h3>
    <ul className="showdown-list">{myShowdowns.map((showdown) => <li key={showdown.id}><div><strong>{showdown.name}</strong><span>{showdown.status} · {showdown.participant_count ?? 1} players</span></div><button className="text-button" onClick={() => void viewLeaderboard(showdown.id)} type="button">Leaderboard</button></li>)}</ul>
    {leaderboard.length > 0 && <ol className="leaderboard-list">{leaderboard.map((entry) => <li key={entry.username}><span>#{entry.rank} @{entry.username}</span><strong>{entry.poop_count}{entry.difference_from_leader > 0 ? ` (${entry.difference_from_leader} behind)` : ''}</strong></li>)}</ol>}
  </section>
}
