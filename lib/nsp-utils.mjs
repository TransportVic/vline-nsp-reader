const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
const dayMapping = {
  'M': 'Mon',
  'Tu': 'Tues',
  'W': 'Wed',
  'Th': 'Thur',
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

  }
}