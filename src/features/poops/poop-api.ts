import { supabase } from '../../lib/supabase'

export type PoopLog = {
  id: string
  logged_at: string
}

export type PoopSummary = {
  todayCount: number
  weekCount: number
}

function configuredClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

export async function getPoopSummary(timeZone: string): Promise<PoopSummary> {
  const { data, error } = await configuredClient().rpc('get_poop_summary', { p_timezone: timeZone })
  if (error) throw error

  const summary = data?.[0]
  return {
    todayCount: Number(summary?.today_count ?? 0),
    weekCount: Number(summary?.week_count ?? 0),
  }
}

export async function getRecentPoopLogs(): Promise<PoopLog[]> {
  const { data, error } = await configuredClient()
    .from('poop_logs')
    .select('id, logged_at')
    .order('logged_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function logPoop() {
  const { error } = await configuredClient().rpc('log_poop')
  if (error) throw error
}

export async function deletePoopLog(id: string) {
  const { error } = await configuredClient().rpc('delete_poop_log', { p_poop_log_id: id })
  if (error) throw error
}
