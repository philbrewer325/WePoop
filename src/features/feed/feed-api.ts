import { supabase } from '../../lib/supabase'

export type FriendActivity = {
  username: string
  activity_date: string
}

export async function getFriendActivity(timeZone: string): Promise<FriendActivity[]> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('get_friend_activity', {
    p_limit: 20,
    p_timezone: timeZone,
  })
  if (error) throw error
  return data ?? []
}
