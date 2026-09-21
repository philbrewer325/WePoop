import { describe, expect, it } from 'vitest'
import { activityDayLabel } from './activity-date'

describe('activityDayLabel', () => {
  it('labels same-day activity without exposing a precise time', () => {
    expect(activityDayLabel('2026-09-21', 'UTC', new Date('2026-09-21T12:00:00Z'))).toBe('Today')
  })

  it('uses a calendar date for earlier activity', () => {
    expect(activityDayLabel('2026-09-20', 'UTC', new Date('2026-09-21T12:00:00Z'))).toMatch(/Sep/)
  })
})
