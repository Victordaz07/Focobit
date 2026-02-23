import { getFirestoreDb, doc, setDoc, getDoc, serverTimestamp } from './firestore'
import { COLLECTIONS } from './collections'
import { UserProfile, OnboardingData } from '@focobit/shared'
import { GamificationProfile, Skills } from '@focobit/shared'

export async function createUserProfile(
  uid: string,
  data: { displayName: string; email: string } & OnboardingData
): Promise<void> {
  const db = getFirestoreDb()
  const isMinor = (data.age ?? 99) < 18

  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid,
    displayName: data.displayName,
    email: data.email,
    age: data.age,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    energyProfile: data.energyProfile,
    reminderStyle: data.reminderStyle,
    onboardingGoals: data.goals,
    isMinor,
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
  }

  // Crear perfil de usuario
  await setDoc(doc(db, COLLECTIONS.USERS, uid), profile)

  // Crear perfil de gamificación inicial
  const gamProfile: Omit<GamificationProfile, 'lastActiveDate'> & { lastActiveDate: ReturnType<typeof serverTimestamp> } = {
    userId: uid,
    xp: 0,
    coins: 0,
    level: 1,
    streakState: 'active',
    streakDays: 0,
    lastActiveDate: serverTimestamp(),
    totalTasksCompleted: 0,
    totalFocusSessions: 0,
  }
  await setDoc(doc(db, 'users', uid, 'gamification', 'profile'), gamProfile)

  // Crear skills iniciales
  const skills: Skills = {
    focus: { level: 1, xp: 0 },
    order: { level: 1, xp: 0 },
    consistency: { level: 1, xp: 0 },
    energy: { level: 1, xp: 0 },
  }
  await setDoc(doc(db, 'users', uid, 'skills', 'profile'), skills)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestoreDb()
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function getGamificationProfile(uid: string): Promise<GamificationProfile | null> {
  const db = getFirestoreDb()
  const snap = await getDoc(doc(db, 'users', uid, 'gamification', 'profile'))
  if (!snap.exists()) return null
  return snap.data() as GamificationProfile
}
