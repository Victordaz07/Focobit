export type RoutineType = 'morning' | 'night' | 'custom'
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface RoutineStep {
  id: string
  title: string
  done: boolean
  durationMin?: number
}

export interface Routine {
  id: string
  userId: string
  title: string
  type: RoutineType
  steps: RoutineStep[]
  scheduledTime: string
  activeDays: DayOfWeek[]
  lastCompletedDate?: Date
  streak: number
  createdAt: Date
}

export interface CreateRoutineInput {
  title: string
  type: RoutineType
  steps: Omit<RoutineStep, 'id' | 'done'>[]
  scheduledTime: string
  activeDays: DayOfWeek[]
}
