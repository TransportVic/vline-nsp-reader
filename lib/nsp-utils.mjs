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
  let parts = days.split('+')

  if (parts.length === 1) {
    if (days.endsWith('O')) {
      return getOperationDayLetter(days.slice(0, -1)).map(code => dayMapping[code])
    } else if (days.endsWith('E')) {
      let excludedDays = getOperationDayLetter(days.slice(0, -1)).map(code => dayMapping[code])
      return daysOfWeek.slice(0, -2).filter(day => !excludedDays.includes(day))
    } else if (days === 'MF') return daysOfWeek.slice(0, -2)
    else if (days === 'Daily') return daysOfWeek.slice(0)
    else if (daysOfWeek.includes(days)) return [ days ]
    return []
  }
  
  return parts.map(part => getOperationDays(part)).reduce((acc, e) => acc.concat(e), [])
}