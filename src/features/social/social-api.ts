import { supabase } from '../../lib/supabase'

export type UserSearchResult = { id: string; username: string }
export type Friend = { id: string; username: string }
export type AppNotification = {
  id: string
  type: 'friend_request' | 'friend_accepted'
  reference_id: string
  actor_username: string
  read_at: string | null
  created_at: string
}

function configuredClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const { data, error } = await configuredClient().rpc('search_users', { p_query: query })
  if (error) throw error
  return data ?? []
}

export async function sendFriendRequest(recipientId: string) {
  const { error } = await configuredClient().rpc('send_friend_request', { p_recipient_id: recipientId })
  if (error) throw error
}

export async function respondToFriendRequest(friendshipId: string, accept: boolean) {
  const { error } = await configuredClient().rpc('respond_to_friend_request', {
    p_friendship_id: friendshipId,
    p_accept: accept,
  })
  if (error) throw error
}

export async function getFriends(): Promise<Friend[]> {
  const { data, error } = await configuredClient().rpc('list_friends')
  if (error) throw error
  return data ?? []
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data, error } = await configuredClient().rpc('list_notifications')
  if (error) throw error
  return data ?? []
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await configuredClient().rpc('mark_notification_read', { p_notification_id: notificationId })
  if (error) throw error
}
