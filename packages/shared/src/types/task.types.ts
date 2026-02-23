export type EnergyLevel = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped'
export type TaskPriority = 'urgent' | 'normal' | 'someday'
export type TaskCategory = 'work' | 'home' | 'personal' | 'health'
export type BreakdownState = 'none' | 'suggested' | 'confirmed'

export interface MicroStep {
  id: string
  title: string
  done: boolean
  completedAt?: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: TaskStatus
  energyRequired: EnergyLevel
  priority: TaskPriority
  category: TaskCategory
  dueDate?: Date
  breakdownState: BreakdownState
  microSteps: MicroStep[]
  createdAt: Date
  completedAt?: Date
  xpAwarded: boolean
}

export interface CreateTaskInput {
  title: string
  energyRequired: EnergyLevel
  priority?: TaskPriority
  category?: TaskCategory
  dueDate?: Date
  description?: string
}
