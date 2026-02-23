import { create } from 'zustand'
import { Routine } from '@focobit/shared'
import type { DayOfWeek } from '@focobit/shared'

const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

interface RoutinesState {
  routines: Routine[]
  isLoading: boolean
  setRoutines: (routines: Routine[]) => void
  setLoading: (loading: boolean) => void
  getTodayRoutines: () => Routine[]
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  isLoading: true,
  setRoutines: (routines) => set({ routines, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  getTodayRoutines: () => {
    const today = DAY_MAP[new Date().getDay()]
    return get().routines.filter(r => r.activeDays.includes(today as DayOfWeek))
  },
}))
