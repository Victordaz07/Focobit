export type FocusDuration = 5 | 10 | 15 | 20 | 25

export interface FocusSession {
  id: string
  userId: string
  durationMin: FocusDuration
  startedAt: Date
  completedAt?: Date
  completed: boolean
  linkedTaskId?: string
  xpAwarded: boolean
}

export interface CreateFocusSessionInput {
  durationMin: FocusDuration
  linkedTaskId?: string
}
