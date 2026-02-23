export type EnergyProfile = 'morning' | 'afternoon' | 'evening' | 'variable'
export type ReminderStyle = 'gentle' | 'direct' | 'minimal'
export type OnboardingGoal =
  | 'start_tasks'
  | 'maintain_routines'
  | 'focus_more'
  | 'remember_things'
  | 'manage_stress'
  | 'work'
  | 'health'
  | 'home'
  | 'creative'
  | 'social'

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  age?: number
  createdAt: Date
  timezone: string
  energyProfile: EnergyProfile
  reminderStyle: ReminderStyle
  onboardingGoals: OnboardingGoal[]
  isMinor: boolean
  onboardingCompleted: boolean
  avatarUrl?: string
}

export interface OnboardingData {
  energyProfile: EnergyProfile
  reminderStyle: ReminderStyle
  goals: OnboardingGoal[]
  age?: number
}
