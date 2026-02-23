export type StreakState = 'active' | 'paused' | 'recovered'
export type SkillName = 'focus' | 'order' | 'consistency' | 'energy'

export interface SkillLevel {
  level: number   // 1-5
  xp: number
}

export interface Skills {
  focus: SkillLevel
  order: SkillLevel
  consistency: SkillLevel
  energy: SkillLevel
}

export interface GamificationProfile {
  userId: string
  xp: number
  coins: number
  level: number
  streakState: StreakState
  streakDays: number
  lastActiveDate: Date
  totalTasksCompleted: number
  totalFocusSessions: number
}

export interface Achievement {
  id: string
  unlockedAt: Date
  type: string
}
