import { create } from 'zustand'
import { FocusDuration } from '@focobit/shared'

type FocusState = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned'

interface FocusStore {
  state: FocusState
  duration: FocusDuration
  secondsLeft: number
  sessionId: string | null
  linkedTaskId: string | null

  setDuration: (d: FocusDuration) => void
  setLinkedTask: (id: string | null) => void
  startSession: (sessionId: string) => void
  tick: () => void
  pause: () => void
  resume: () => void
  complete: () => void
  abandon: () => void
  reset: () => void
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  state: 'idle',
  duration: 5,
  secondsLeft: 5 * 60,
  sessionId: null,
  linkedTaskId: null,

  setDuration: (duration) => set({ duration, secondsLeft: duration * 60 }),
  setLinkedTask: (linkedTaskId) => set({ linkedTaskId }),

  startSession: (sessionId) => set({
    sessionId,
    state: 'running',
    secondsLeft: get().duration * 60,
  }),

  tick: () => {
    const { secondsLeft } = get()
    if (secondsLeft <= 1) {
      set({ secondsLeft: 0, state: 'completed' })
    } else {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },

  pause: () => set({ state: 'paused' }),
  resume: () => set({ state: 'running' }),
  complete: () => set({ state: 'completed' }),
  abandon: () => set({ state: 'abandoned' }),

  reset: () => set({
    state: 'idle',
    secondsLeft: get().duration * 60,
    sessionId: null,
    linkedTaskId: null,
  }),
}))
