import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  getFriends,
  getNotifications,
  markNotificationRead,
  respondToFriendRequest,
  searchUsers,
  sendFriendRequest,
  type AppNotification,
  type Friend,
  type UserSearchResult,
} from './social-api'
import { messageForSocialError } from './social-errors'

export function SocialPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [nextFriends, nextNotifications] = await Promise.all([getFriends(), getNotifications()])
    setFriends(nextFriends)
    setNotifications(nextNotifications)
  }, [])

  useEffect(() => {
    void refresh()
      .catch((loadError: unknown) => setError(messageForSocialError(loadError)))
      .finally(() => setIsLoading(false))
  }, [refresh])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters to search.')
      return
    }
    setIsSaving(true)
    try {
      setResults(await searchUsers(query))
    } catch (searchError) {
      setError(messageForSocialError(searchError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRequest(userId: string) {
    setError(null)
    setIsSaving(true)
    try {
      await sendFriendRequest(userId)
      setResults((current) => current.filter((user) => user.id !== userId))
    } catch (requestError) {
      setError(messageForSocialError(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleResponse(friendshipId: string, accept: boolean) {
    setError(null)
    setIsSaving(true)
    try {
      await respondToFriendRequest(friendshipId, accept)
      await refresh()
    } catch (responseError) {
      setError(messageForSocialError(responseError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId)
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification
      )))
    } catch (readError) {
      setError(messageForSocialError(readError))
    }
  }

  const unreadNotifications = notifications.filter((notification) => notification.read_at === null)

  return (
    <section className="social-panel" aria-labelledby="friends-heading">
      <div className="social-heading">
        <div>
          <p className="eyebrow">Your crew</p>
          <h2 id="friends-heading">Friends & invites</h2>
        </div>
        {unreadNotifications.length > 0 && <span className="notification-count">{unreadNotifications.length}</span>}
      </div>
      <form className="friend-search" onSubmit={handleSearch}>
        <label className="sr-only" htmlFor="friend-search">Find a username</label>
        <input
          id="friend-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a username"
          maxLength={20}
        />
        <button className="secondary-button" type="submit" disabled={isSaving}>Find</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {results.length > 0 && (
        <ul className="social-list">
          {results.map((user) => (
            <li key={user.id}>
              <span>@{user.username}</span>
              <button className="text-button" type="button" disabled={isSaving} onClick={() => void handleRequest(user.id)}>
                Add friend
              </button>
            </li>
          ))}
        </ul>
      )}
      {unreadNotifications.length > 0 && (
        <ul className="notification-list" aria-label="Notifications">
          {unreadNotifications.map((notification) => (
            <li key={notification.id}>
              {notification.type === 'friend_request' ? (
                <>
                  <p><strong>@{notification.actor_username}</strong> wants to be friends.</p>
                  <div className="notification-actions">
                    <button className="secondary-button" type="button" disabled={isSaving} onClick={() => void handleResponse(notification.reference_id, true)}>Accept</button>
                    <button className="text-button" type="button" disabled={isSaving} onClick={() => void handleResponse(notification.reference_id, false)}>Decline</button>
                  </div>
                </>
              ) : (
                <button className="notification-copy" type="button" onClick={() => void handleMarkRead(notification.id)}>
                  <strong>@{notification.actor_username}</strong> accepted your friend request.
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="friends-list">
        <h3>Your friends</h3>
        {isLoading ? <p className="hint">Loading friends...</p> : friends.length === 0 ? <p className="hint">Find a friend to start your crew.</p> : (
          <ul className="social-list">
            {friends.map((friend) => <li key={friend.id}><span>@{friend.username}</span></li>)}
          </ul>
        )}
      </div>
    </section>
  )
}
