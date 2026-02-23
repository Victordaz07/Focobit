import { useEffect, useCallback } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { getPendingOps, removePendingOp, type CreateTaskInput } from '@focobit/shared'
import {
  completeTask, createTask, completeRoutine,
  toggleMicroStep, completeFocusSession,
} from '@focobit/firebase-config'
import { useAuthStore, useOfflineStore } from '../stores'

export function useNetworkSync() {
  const { user } = useAuthStore()
  const { setOnline, setPendingCount, setSyncing } = useOfflineStore()
  const uid = user?.uid ?? ''

  const syncPendingOps = useCallback(async () => {
    if (!uid) return
    const ops = getPendingOps()
    if (ops.length === 0) return

    setSyncing(true)
    for (const op of ops) {
      try {
        switch (op.type) {
          case 'complete_task':
            await completeTask(uid, op.payload.taskId as string)
            break
          case 'create_task':
            await createTask(uid, op.payload as unknown as CreateTaskInput)
            break
          case 'complete_routine':
            await completeRoutine(uid, op.payload.routineId as string)
            break
          case 'toggle_step':
            await toggleMicroStep(uid, op.payload.taskId as string, op.payload.stepId as string, op.payload.done as boolean)
            break
          case 'complete_focus':
            await completeFocusSession(uid, op.payload.sessionId as string)
            break
        }
        removePendingOp(op.id)
      } catch (e) {
        console.warn(`Failed to sync op ${op.id}:`, e)
      }
    }

    const remaining = getPendingOps()
    setPendingCount(remaining.length)
    setSyncing(false)
  }, [uid, setPendingCount, setSyncing])

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable !== false
      setOnline(online)
      setPendingCount(getPendingOps().length)
      if (online) syncPendingOps()
    })
    return () => unsub()
  }, [syncPendingOps, setOnline, setPendingCount])

  return { syncPendingOps }
}
