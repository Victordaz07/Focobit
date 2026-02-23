import {
  getFirestoreDb, doc, setDoc, updateDoc,
  serverTimestamp,
} from './firestore'
import { CreateFocusSessionInput } from '@focobit/shared'

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function startFocusSession(
  uid: string,
  input: CreateFocusSessionInput
): Promise<string> {
  const db = getFirestoreDb()
  const id = generateId()
  const session = {
    id,
    userId: uid,
    durationMin: input.durationMin,
    startedAt: serverTimestamp(),
    completed: false,
    linkedTaskId: input.linkedTaskId ?? null,
    xpAwarded: false,
  }
  await setDoc(doc(db, 'users', uid, 'focusSessions', id), session)
  return id
}

export async function completeFocusSession(uid: string, sessionId: string): Promise<void> {
  const db = getFirestoreDb()
  await updateDoc(doc(db, 'users', uid, 'focusSessions', sessionId), {
    completed: true,
    completedAt: serverTimestamp(),
  })
}

export async function abandonFocusSession(uid: string, sessionId: string): Promise<void> {
  const db = getFirestoreDb()
  await updateDoc(doc(db, 'users', uid, 'focusSessions', sessionId), {
    completed: false,
    completedAt: serverTimestamp(),
  })
}
