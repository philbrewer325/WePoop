import { z } from 'zod'

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Choose 3 to 20 characters.')
  .max(20, 'Choose 3 to 20 characters.')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Use letters, numbers, underscores, or hyphens only.')

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}
