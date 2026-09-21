import { describe, expect, it } from 'vitest'
import { messageForSocialError } from './social-errors'

describe('messageForSocialError', () => {
  it('makes duplicate requests clear', () => {
    expect(messageForSocialError({ message: 'Friend request already sent' })).toBe('Friend request already sent.')
  })

  it('retains unexpected server errors', () => {
    expect(messageForSocialError({ message: 'permission denied' })).toBe('Unable to update friends: permission denied')
  })
})
