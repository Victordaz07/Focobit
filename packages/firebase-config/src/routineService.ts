import {
  getFirestoreDb, doc, setDoc, updateDoc, deleteDoc,
  collection, query, getDocs, onSnapshot, serverTimestamp, getDoc,
} from './firestore'
import { Routine, CreateRoutineInput, RoutineStep } from '@focobit/shared'

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function createRoutine(uid: string, input: CreateRoutineInput): Promise<Routine> {
  const db = getFirestoreDb()
  const id = generateId()
  const steps: RoutineStep[] = input.steps.map(s => ({
    id: generateId(),
    title: s.title,
    done: false,
    durationMin: s.durationMin,
  }))
  const routine = {
    id,
    userId: uid,
    title: input.title,
    type: input.type,
    steps,
    scheduledTime: input.scheduledTime,
    activeDays: input.activeDays,
    streak: 0,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'users', uid, 'routines', id), routine)
  return { ...routine, createdAt: new Date() } as Routine
}

export function subscribeToRoutines(uid: string, callback: (routines: Routine[]) => void) {
  const db = getFirestoreDb()
  const q = query(collection(db, 'users', uid, 'routines'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Routine))
  })
}

export async function completeRoutineStep(
  uid: string, routineId: string, stepId: string
): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'routines', routineId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const routine = snap.data() as Routine
  const steps = routine.steps.map(s => s.id === stepId ? { ...s, done: true } : s)
  await updateDoc(ref, { steps })
}

export async function completeRoutine(uid: string, routineId: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'routines', routineId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const routine = snap.data() as Routine
  await updateDoc(ref, {
    lastCompletedDate: serverTimestamp(),
    streak: (routine.streak ?? 0) + 1,
    steps: routine.steps.map(s => ({ ...s, done: false })), // reset para mañana
  })
}

export async function deleteRoutine(uid: string, routineId: string): Promise<void> {
  const db = getFirestoreDb()
  await deleteDoc(doc(db, 'users', uid, 'routines', routineId))
}
