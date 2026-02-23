import { create } from 'zustand'
import { OnboardingData, EnergyProfile, ReminderStyle, OnboardingGoal } from '@focobit/shared'

interface OnboardingState {
  step: number
  data: Partial<OnboardingData>
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setEnergyProfile: (energy: EnergyProfile) => void
  setReminderStyle: (style: ReminderStyle) => void
  toggleGoal: (goal: OnboardingGoal) => void
  setAge: (age: number) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  data: {
    goals: [],
  },

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

  setEnergyProfile: (energyProfile) =>
    set((state) => ({ data: { ...state.data, energyProfile } })),

  setReminderStyle: (reminderStyle) =>
    set((state) => ({ data: { ...state.data, reminderStyle } })),

  toggleGoal: (goal) =>
    set((state) => {
      const goals = state.data.goals ?? []
      const exists = goals.includes(goal)
      return {
        data: {
          ...state.data,
          goals: exists ? goals.filter((g) => g !== goal) : [...goals, goal],
        },
      }
    }),

  setAge: (age) => set((state) => ({ data: { ...state.data, age } })),

  reset: () => set({ step: 1, data: { goals: [] } }),
}))
