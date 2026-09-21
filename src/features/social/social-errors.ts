export function messageForSocialError(error: unknown) {
  const message = (
    typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error'
  )

  if (message.toLowerCase().includes('friend request already sent')) return 'Friend request already sent.'
  if (message.toLowerCase().includes('already friends')) return 'You are already friends.'
  if (message.toLowerCase().includes('too many friend requests')) return 'You have sent too many requests. Try again later.'
  return `Unable to update friends: ${message}`
}
