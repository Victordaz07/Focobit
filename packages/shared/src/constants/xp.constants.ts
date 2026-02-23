export const XP_REWARDS = {
  microStep: 5,
  task: 20,
  routine: 25,
  focusSession: 15,
  streakRecovery: 30,
  dailyCheckIn: 10,
  challengeComplete: 50,
} as const

export const COIN_REWARDS = {
  microStep: 1,
  task: 5,
  routine: 7,
  focusSession: 3,
  streakRecovery: 10,
  challengeComplete: 20,
} as const

export const MAX_DAILY_XP = 200
export const XP_PER_LEVEL = 300
export const MAX_SKILL_LEVEL = 5
export const SKILL_XP_PER_LEVEL = 100
export const STREAK_RECOVERY_WINDOW_HOURS = 48
