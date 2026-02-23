import { useEffect } from 'react'
import {
  getOrCreateWeeklyChallenges,
  subscribeToWeeklyChallenges,
  checkAndUnlockAchievements,
} from '@focobit/firebase-config'
import { calculateLevel } from '@focobit/shared'
import { useAuthStore, useChallengesStore, useGamificationStore } from '../stores'

export function useChallenges() {
  const { user } = useAuthStore()
  const { setWeeklyChallenge, addNewAchievements } = useChallengesStore()
  const { profile: gamProfile } = useGamificationStore()
  const uid = user?.uid ?? ''

  useEffect(() => {
    if (!uid) return

    // Obtener o crear retos de la semana
    getOrCreateWeeklyChallenges(uid).then(data => {
      if (data) setWeeklyChallenge(data)
    })

    // Suscripción realtime
    const unsub = subscribeToWeeklyChallenges(uid, data => {
      if (data) setWeeklyChallenge(data)
    })

    return unsub
  }, [uid])

  useEffect(() => {
    if (!uid || !gamProfile) return

    const level = calculateLevel(gamProfile.xp ?? 0)

    // Verificar achievements cuando cambia el perfil de gamificación
    checkAndUnlockAchievements(uid, {
      totalTasks: gamProfile.totalTasksCompleted ?? 0,
      totalFocus: gamProfile.totalFocusSessions ?? 0,
      streakDays: gamProfile.streakDays ?? 0,
      streakState: gamProfile.streakState ?? 'active',
      level,
      totalRoutines: 0,
      coins: gamProfile.coins ?? 0,
    }).then(newOnes => {
      if (newOnes.length > 0) addNewAchievements(newOnes)
    })
  }, [gamProfile?.xp])
}
