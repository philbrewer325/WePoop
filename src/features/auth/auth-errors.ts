export function messageForAuthError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('anonymous sign-ins are disabled')) {
    return 'Anonymous Sign-Ins are disabled in Supabase. Enable them in Authentication → Providers, then try again.'
  }
  if (normalizedMessage.includes('email signups are disabled')) {
    return 'Username/password sign-in has not been enabled in Supabase yet.'
  }
  if (normalizedMessage.includes('invalid login credentials')) {
    return 'The username or password is incorrect.'
  }
  if (normalizedMessage.includes('email not confirmed')) {
    return 'Account confirmation is misconfigured. Disable Confirm email in Supabase Auth settings.'
  }
  if (normalizedMessage.includes('user already registered')) {
    return 'That username is already taken.'
  }
  if (normalizedMessage.includes('profiles_normalized_username_key')) {
    return 'That username is already taken.'
  }
  if (normalizedMessage.includes('reserved')) {
    return 'That username is reserved.'
  }
  if (normalizedMessage.includes('database error saving new user')) {
    return 'That username is unavailable. If this is your existing anonymous account, it must be recovered by an administrator.'
  }
  return `Account creation failed: ${message}`
}
