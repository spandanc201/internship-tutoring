const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "Jul 19, 2026" */
export function fmtDate(date: Date | string): string {
  const d = new Date(date)
  return `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "today" / "3d ago" / "1w ago" / "2mo ago" */
export function relDate(date: Date | string): string {
  const d = new Date(date)
  const days = Math.round((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

/** "$9k–$11k/mo" from a {min,max,unit} json, or its best effort */
export function salaryText(salary: any): string {
  if (!salary) return 'Not disclosed'
  if (typeof salary.min === 'number' && typeof salary.max === 'number') {
    const k = (n: number) => (n >= 1000 ? `${n / 1000}k` : `${n}`)
    return `$${k(salary.min)}\u2013$${k(salary.max)}${salary.unit || '/mo'}`
  }
  if (typeof salary.range === 'string') return salary.range
  return 'Not disclosed'
}

/** Local YYYY-MM-DD key for a date */
export function dayKey(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Today's date as "SUNDAY, JULY 19" kicker text */
export function todayKicker(): string {
  const d = new Date()
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  return `${weekday}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** Time-of-day greeting */
export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Display name ("Spandan C." best effort) and monogram from an email */
export function nameFromEmail(email: string | null | undefined): { name: string; monogram: string } {
  if (!email) return { name: 'Student', monogram: 'ST' }
  const local = email.split('@')[0]
  const parts = local.split(/[._-]+/).filter(Boolean)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const name =
    parts.length >= 2 ? `${cap(parts[0])} ${cap(parts[1]).charAt(0)}.` : cap(parts[0] || 'Student')
  const monogram =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : local.slice(0, 2).toUpperCase() || 'ST'
  return { name, monogram }
}
