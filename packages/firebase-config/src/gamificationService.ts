import { getFirestoreDb, doc, updateDoc, getDoc, serverTimestamp } from './firestore'
import { XP_REWARDS, COIN_REWARDS, SKILL_XP_PER_LEVEL } from '@focobit/shared'
import { calculateLevel, getStreakStatus, isActiveDay } from '@focobit/shared'
import { GamificationProfile, Skills, SkillName } from '@focobit/shared'

export async function awardXPForAction(
  uid: string,
  action: keyof typeof XP_REWARDS
): Promise<{ xpGained: number; coinsGained: number; leveledUp: boolean }> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(ref)

  if (!snap.exists()) return { xpGained: 0, coinsGained: 0, leveledUp: false }

  const profile = snap.data() as GamificationProfile
  const xpGain = XP_REWARDS[action]
  const coinGain = COIN_REWARDS[action as keyof typeof COIN_REWARDS] ?? 0

  const oldLevel = calculateLevel(profile.xp)
  const newXP = profile.xp + xpGain
  const newCoins = profile.coins + coinGain
  const newLevel = calculateLevel(newXP)

  await updateDoc(ref, {
    xp: newXP,
    coins: newCoins,
    level: newLevel,
    totalFocusSessions: action === 'focusSession'
      ? (profile.totalFocusSessions ?? 0) + 1
      : profile.totalFocusSessions,
    totalTasksCompleted: action === 'task'
      ? (profile.totalTasksCompleted ?? 0) + 1
      : profile.totalTasksCompleted,
  })

  // Actualizar skill correspondiente
  const skillMap: Partial<Record<keyof typeof XP_REWARDS, SkillName>> = {
    focusSession: 'focus',
    task: 'order',
    routine: 'consistency',
    dailyCheckIn: 'energy',
  }
  const skillToUpdate = skillMap[action]
  if (skillToUpdate) {
    await addSkillXP(uid, skillToUpdate, 10)
  }

  return { xpGained: xpGain, coinsGained: coinGain, leveledUp: newLevel > oldLevel }
}

export async function addSkillXP(uid: string, skill: SkillName, amount: number): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'skills', 'profile')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const skills = snap.data() as Skills
  const current = skills[skill]
  const newXP = current.xp + amount
  const newLevel = Math.min(5, Math.floor(newXP / SKILL_XP_PER_LEVEL) + 1)

  await updateDoc(ref, {
    [`${skill}.xp`]: newXP,
    [`${skill}.level`]: newLevel,
  })
}

export async function updateStreak(uid: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const profile = snap.data() as GamificationProfile
  const lastActive = (profile.lastActiveDate as { toDate?: () => Date })?.toDate?.() ?? new Date(0)

  if (isActiveDay(lastActive)) return // Ya fue activo hoy

  const { canRecover } = getStreakStatus(lastActive)

  const updates: Record<string, unknown> = { lastActiveDate: serverTimestamp() }

  if (canRecover && profile.streakState === 'paused') {
    updates.streakDays = (profile.streakDays ?? 0) + 1
    updates.streakState = 'recovered'
  } else if (profile.streakState === 'active') {
    updates.streakDays = (profile.streakDays ?? 0) + 1
  } else {
    updates.streakDays = 1
    updates.streakState = 'active'
  }

  await updateDoc(ref, updates)
}
