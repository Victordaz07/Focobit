import { create } from 'zustand'
import type { WeeklyChallenge, Achievement } from '@focobit/firebase-config'

interface ChallengesState {
  weeklyChallenge: WeeklyChallenge | null
  newAchievements: Achievement[]
  setWeeklyChallenge: (data: WeeklyChallenge | null) => void
  addNewAchievements: (achievements: Achievement[]) => void
  clearNewAchievements: () => void
}

export const useChallengesStore = create<ChallengesState>((set) => ({
  weeklyChallenge: null,
  newAchievements: [],
  setWeeklyChallenge: (weeklyChallenge) => set({ weeklyChallenge }),
  addNewAchievements: (achievements) =>
    set(state => ({ newAchievements: [...state.newAchievements, ...achievements] })),
  clearNewAchievements: () => set({ newAchievements: [] }),
}))
