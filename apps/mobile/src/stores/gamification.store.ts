import { create } from 'zustand'
import { GamificationProfile } from '@focobit/shared'
import { calculateLevel, xpToNextLevel, xpProgressPercent } from '@focobit/shared'

interface GamificationState {
  profile: GamificationProfile | null
  setProfile: (profile: GamificationProfile) => void
  level: number
  xpToNext: number
  xpPercent: number
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  profile: null,
  level: 1,
  xpToNext: 300,
  xpPercent: 0,

  setProfile: (profile) => set({
    profile,
    level: calculateLevel(profile.xp),
    xpToNext: xpToNextLevel(profile.xp),
    xpPercent: xpProgressPercent(profile.xp),
  }),
}))
