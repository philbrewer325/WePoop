import { describe, expect, it } from 'vitest'
import { normalizeUsername, usernameSchema } from './username'

describe('usernameSchema', () => {
  it('accepts the supported username characters and lengths', () => {
    expect(usernameSchema.parse('Phil_Brewer-325')).toBe('Phil_Brewer-325')
  })

  it.each(['ab', 'a'.repeat(21), 'not valid', 'emoji-💩'])('rejects invalid username %s', (username) => {
    expect(usernameSchema.safeParse(username).success).toBe(false)
  })

  it('normalizes usernames for case-insensitive identity checks', () => {
    expect(normalizeUsername('  Phil_Brewer  ')).toBe('phil_brewer')
  })
})
