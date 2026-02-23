import type { EnergyLevel } from './task.types'

export type MoodLevel = 'overwhelmed' | 'neutral' | 'good' | 'great'

export interface CheckIn {
  id: string
  userId: string
  timestamp: Date
  energyLevel: EnergyLevel
  mood: MoodLevel
  crisisMode: boolean
}

export interface CreateCheckInInput {
  energyLevel: EnergyLevel
  mood: MoodLevel
  crisisMode?: boolean
}
