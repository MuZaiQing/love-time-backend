export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function getTimeComponents(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now - start

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

export function calculateCountdown(targetDate) {
  const target = new Date(targetDate)
  const now = new Date()
  target.setFullYear(now.getFullYear())
  if (target < now) {
    target.setFullYear(now.getFullYear() + 1)
  }
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calculateDays(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  start.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}