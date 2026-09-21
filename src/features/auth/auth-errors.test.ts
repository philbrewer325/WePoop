import { describe, expect, it } from 'vitest'
import { messageForAuthError } from './auth-errors'

describe('messageForAuthError', () => {
  it('explains when anonymous sign-ins are disabled', () => {
    expect(messageForAuthError('Anonymous sign-ins are disabled')).toContain('Enable them')
  })

  it('keeps unrecognized provider errors actionable', () => {
    expect(messageForAuthError('unexpected provider response')).toBe(
      'Account creation failed: unexpected provider response',
    )
  })
})
