// Cola de operaciones pendientes para modo offline
export interface PendingOperation {
  id: string
  type: 'complete_task' | 'create_task' | 'complete_routine' | 'toggle_step' | 'complete_focus'
  payload: Record<string, unknown>
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'focobit_pending_ops'

export function getPendingOps(): PendingOperation[] {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addPendingOp(op: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): void {
  const ops = getPendingOps()
  ops.push({ ...op, id: Math.random().toString(36).slice(2), timestamp: Date.now(), retries: 0 })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops))
}

export function removePendingOp(id: string): void {
  const ops = getPendingOps().filter(op => op.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops))
}

export function clearPendingOps(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
}
