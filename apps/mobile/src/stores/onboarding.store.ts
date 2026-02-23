import { create } from 'zustand'
import type { EnergyProfile, ReminderStyle, OnboardingGoal } from '@focobit/shared'

interface OnboardingState {
  step: number
  energy: EnergyProfile
  reminderStyle: ReminderStyle
  goals: OnboardingGoal[]
  setStep: (step: number) => void
  setEnergy: (energy: EnergyProfile) => void
  setReminderStyle: (style: ReminderStyle) => void
  toggleGoal: (goal: OnboardingGoal) => void
  setData: (data: Partial<{ energy: EnergyProfile; reminderStyle: ReminderStyle; goals: OnboardingGoal[] }>) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  energy: 'variable',
  reminderStyle: 'gentle',
  goals: [],

  setStep: (step) => set({ step }),
  setEnergy: (energy) => set({ energy }),
  setReminderStyle: (reminderStyle) => set({ reminderStyle }),
  toggleGoal: (goal) =>
    set((state) => {
      const exists = state.goals.includes(goal)
      return {
        goals: exists ? state.goals.filter((g) => g !== goal) : [...state.goals, goal],
      }
    }),
  setData: (data) =>
    set((state) => ({
      energy: data.energy ?? state.energy,
      reminderStyle: data.reminderStyle ?? state.reminderStyle,
      goals: data.goals ?? state.goals,
    })),
  reset: () => set({ step: 0, energy: 'variable', reminderStyle: 'gentle', goals: [] }),
}))
