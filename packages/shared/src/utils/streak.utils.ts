import { STREAK_RECOVERY_WINDOW_HOURS } from '../constants/xp.constants'
import { StreakState } from '../types/gamification.types'

export function getStreakStatus(lastActiveDate: Date): {
  state: StreakState
  canRecover: boolean
  hoursElapsed: number
} {
  const now = new Date()
  const diffMs = now.getTime() - lastActiveDate.getTime()
  const hoursElapsed = diffMs / (1000 * 60 * 60)
  const daysElapsed = Math.floor(hoursElapsed / 24)

  if (daysElapsed === 0) {
    return { state: 'active', canRecover: false, hoursElapsed }
  }

  if (hoursElapsed <= STREAK_RECOVERY_WINDOW_HOURS) {
    return { state: 'paused', canRecover: true, hoursElapsed }
  }

  return { state: 'paused', canRecover: false, hoursElapsed }
}

export function isActiveDay(lastActiveDate: Date): boolean {
  const today = new Date()
  return (
    today.getFullYear() === lastActiveDate.getFullYear() &&
    today.getMonth() === lastActiveDate.getMonth() &&
    today.getDate() === lastActiveDate.getDate()
  )
}
