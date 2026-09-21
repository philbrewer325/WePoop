function dateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(date)
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
}

export function activityDayLabel(activityDate: string, timeZone: string, now = new Date()) {
  const today = dateParts(now, timeZone)
  const todayIso = `${today.year}-${today.month}-${today.day}`
  if (activityDate === todayIso) return 'Today'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${activityDate}T00:00:00`))
}
