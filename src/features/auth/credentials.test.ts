import { describe, expect, it } from 'vitest'
import { authEmailForUsername, passwordSchema } from './credentials'

describe('authEmailForUsername', () => {
  it('uses a case-insensitive internal address without asking users for email', () => {
    expect(authEmailForUsername('  Phil_Brewer  ')).toBe('phil_brewer@accounts.wepoop.invalid')
  })
})

describe('passwordSchema', () => {
  it('requires a password suitable for a returning account', () => {
    expect(passwordSchema.safeParse('long-enough-password').success).toBe(true)
    expect(passwordSchema.safeParse('short').success).toBe(false)
  })
})
