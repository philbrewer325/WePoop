import { z } from 'zod'
import { normalizeUsername, usernameSchema } from './username'

const internalAuthDomain = 'accounts.wepoop.invalid'

export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(72, 'Use 72 characters or fewer.')

export function authEmailForUsername(username: string) {
  const normalizedUsername = usernameSchema.parse(username)
  return `${normalizeUsername(normalizedUsername)}@${internalAuthDomain}`
}
