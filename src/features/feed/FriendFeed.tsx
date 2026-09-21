import { useCallback, useEffect, useState } from 'react'
import { messageForSocialError } from '../social/social-errors'
import { getBrowserTimeZone } from '../poops/time-zone'
import { activityDayLabel } from './activity-date'
import { getFriendActivity, type FriendActivity } from './feed-api'

const timeZone = getBrowserTimeZone()

export function FriendFeed() {
  const [activity, setActivity] = useState<FriendActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActivity = useCallback(async () => {
    setActivity(await getFriendActivity(timeZone))
  }, [])

  useEffect(() => {
    void loadActivity()
      .catch((loadError: unknown) => setError(messageForSocialError(loadError)))
      .finally(() => setIsLoading(false))
  }, [loadActivity])

  return (
    <section className="friend-feed" aria-labelledby="feed-heading">
      <div className="feed-heading">
        <div>
          <p className="eyebrow">Friends’ logbook</p>
          <h2 id="feed-heading">Recent activity</h2>
        </div>
        <span className="feed-privacy">No exact times</span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <p className="hint">Loading your friends’ activity...</p>
      ) : activity.length === 0 ? (
        <p className="hint">Friend activity will appear here when your crew starts logging.</p>
      ) : (
        <ul className="feed-list">
          {activity.map((item, index) => (
            <li key={`${item.username}-${item.activity_date}-${index}`}>
              <span className="activity-dot" aria-hidden="true">💩</span>
              <p><strong>@{item.username}</strong> logged a poop</p>
              <time dateTime={item.activity_date}>{activityDayLabel(item.activity_date, timeZone)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
