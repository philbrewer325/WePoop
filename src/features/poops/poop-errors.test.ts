import { describe, expect, it } from 'vitest'
import { messageForPoopError } from './poop-errors'

describe('messageForPoopError', () => {
  it('explains the server-side logging cooldown', () => {
    expect(messageForPoopError('Please wait 10 seconds before logging again')).toBe(
      'Give it a moment before logging again.',
    )
  })

  it('preserves unexpected errors instead of concealing them', () => {
    expect(messageForPoopError('relation does not exist')).toBe(
      'Unable to update your logbook: relation does not exist',
    )
  })

  it('preserves messages from Supabase-style error objects', () => {
    expect(messageForPoopError({ message: 'permission denied' })).toBe(
      'Unable to update your logbook: permission denied',
    )
  })
})
