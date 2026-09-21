function errorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return 'Unknown error'
}

export function messageForPoopError(error: unknown) {
  const message = errorMessage(error)
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('wait 10 seconds')) {
    return 'Give it a moment before logging again.'
  }
  if (normalizedMessage.includes('not found or already deleted')) {
    return 'That log is no longer available.'
  }
  if (normalizedMessage.includes('active user account required')) {
    return 'Your account is not active, so logging is unavailable.'
  }
  return `Unable to update your logbook: ${message}`
}
