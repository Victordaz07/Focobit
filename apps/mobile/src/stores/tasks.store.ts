import { create } from 'zustand'
import { Task, EnergyLevel } from '@focobit/shared'
import { getTopTasksForToday } from '@focobit/shared'

interface TasksState {
  tasks: Task[]
  currentEnergy: EnergyLevel
  isLoading: boolean
  setTasks: (tasks: Task[]) => void
  setEnergy: (energy: EnergyLevel) => void
  setLoading: (loading: boolean) => void
  getTodayTasks: () => Task[]
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  currentEnergy: 'medium',
  isLoading: true,

  setTasks: (tasks) => set({ tasks, isLoading: false }),
  setEnergy: (currentEnergy) => set({ currentEnergy }),
  setLoading: (isLoading) => set({ isLoading }),

  getTodayTasks: () => {
    const { tasks, currentEnergy } = get()
    return getTopTasksForToday(tasks, currentEnergy, 3)
  },
}))
