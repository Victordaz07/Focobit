import {
  getFirestoreDb, doc, getDoc, onSnapshot
} from './firestore'
import { COLLECTIONS } from './collections'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp } from './client'

export interface Challenge {
  id: string
  title: string
  type: string
  targetCount: number
  currentCount: number
  completed: boolean
  xpReward: number
  coinReward: number
}

export interface WeeklyChallenge {
  weekId: string
  challenges: Challenge[]
}

function getWeekId(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function getOrCreateWeeklyChallenges(uid: string): Promise<WeeklyChallenge | null> {
  const db = getFirestoreDb()
  const weekId = getWeekId()
  const ref = doc(db, 'users', uid, 'challenges', weekId)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data() as WeeklyChallenge
  }

  // Llamar Cloud Function para generar retos
  try {
    const functions = getFunctions(getFirebaseApp())
    const generate = httpsCallable(functions, 'generateChallengesForUser')
    const result = await generate({})
    return result.data as WeeklyChallenge
  } catch (e) {
    console.error('Error generating challenges:', e)
    return null
  }
}

export function subscribeToWeeklyChallenges(
  uid: string,
  callback: (data: WeeklyChallenge | null) => void
) {
  const db = getFirestoreDb()
  const weekId = getWeekId()
  const ref = doc(db, 'users', uid, 'challenges', weekId)
  return onSnapshot(ref, snap => {
    callback(snap.exists() ? (snap.data() as WeeklyChallenge) : null)
  })
}
