const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayMapping = {
  'M': 'Mon',
  'Tu': 'Tue',
  'W': 'Wed',
  'Th': 'Thu',
  'F': 'Fri',
  'Sat': 'Sat',
  'Sun': 'Sun',
  'Su': 'Sun'
}

export function getOperationDayLetter(letters) {
  return letters.match(/([A-Z][a-z]*)/g)
}

export function getOperationDays(days) {
  if (days.endsWith('O')) {
    return getOperationDayLetter(days.slice(0, -1)).map(code => dayMapping[code])
  }
}