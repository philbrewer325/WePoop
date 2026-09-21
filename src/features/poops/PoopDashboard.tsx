import { useCallback, useEffect, useState } from 'react'
import { deletePoopLog, getPoopSummary, getRecentPoopLogs, logPoop, type PoopLog, type PoopSummary } from './poop-api'
import { messageForPoopError } from './poop-errors'
import { formatPoopTimestamp, getBrowserTimeZone } from './time-zone'

const emptySummary: PoopSummary = { todayCount: 0, weekCount: 0 }
const timeZone = getBrowserTimeZone()

export function PoopDashboard() {
  const [summary, setSummary] = useState<PoopSummary>(emptySummary)
  const [logs, setLogs] = useState<PoopLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [nextSummary, nextLogs] = await Promise.all([
      getPoopSummary(timeZone),
      getRecentPoopLogs(),
    ])
    setSummary(nextSummary)
    setLogs(nextLogs)
  }, [])

  const finishInitialLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
      .catch((refreshError: unknown) => setError(messageForPoopError(refreshError)))
      .finally(finishInitialLoad)
  }, [finishInitialLoad, refresh])

  async function handleLog() {
    setError(null)
    setIsSaving(true)
    try {
      await logPoop()
      await refresh()
    } catch (logError) {
      setError(messageForPoopError(logError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    setIsSaving(true)
    try {
      await deletePoopLog(id)
      await refresh()
    } catch (deleteError) {
      setError(messageForPoopError(deleteError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="metric-grid" aria-live="polite">
        <article className="metric-card">
          <span>Today</span>
          <strong>{isLoading ? '–' : summary.todayCount}</strong>
          <p>logs</p>
        </article>
        <article className="metric-card">
          <span>This week</span>
          <strong>{isLoading ? '–' : summary.weekCount}</strong>
          <p>logs</p>
        </article>
      </div>
      <button className="primary-button" type="button" disabled={isSaving || isLoading} onClick={() => void handleLog()}>
        {isSaving ? 'Saving...' : 'Log a poop 💩'}
      </button>
      {error && <p className="form-error dashboard-error" role="alert">{error}</p>}
      <section className="history" aria-labelledby="recent-logs-heading">
        <div className="history-heading">
          <h2 id="recent-logs-heading">Recent logs</h2>
          <span>{timeZone}</span>
        </div>
        {isLoading ? (
          <p className="hint">Loading your history...</p>
        ) : logs.length === 0 ? (
          <p className="hint">Your first log will appear here.</p>
        ) : (
          <ul className="log-list">
            {logs.map((log) => (
              <li key={log.id}>
                <time dateTime={log.logged_at}>{formatPoopTimestamp(log.logged_at, timeZone)}</time>
                <button className="text-button" type="button" disabled={isSaving} onClick={() => void handleDelete(log.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
