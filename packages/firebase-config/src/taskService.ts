import {
  getFirestoreDb, doc, setDoc, updateDoc, deleteDoc, getDoc,
  collection, query, where, orderBy, getDocs, onSnapshot, serverTimestamp,
} from './firestore'
import { Task, CreateTaskInput, TaskStatus } from '@focobit/shared'

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function createTask(uid: string, input: CreateTaskInput): Promise<Task> {
  const db = getFirestoreDb()
  const id = generateId()
  const task: Omit<Task, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id,
    userId: uid,
    title: input.title,
    description: input.description ?? '',
    status: 'pending',
    energyRequired: input.energyRequired,
    priority: input.priority ?? 'normal',
    category: input.category ?? 'personal',
    dueDate: input.dueDate,
    breakdownState: 'none',
    microSteps: [],
    createdAt: serverTimestamp(),
    xpAwarded: false,
  }
  await setDoc(doc(db, 'users', uid, 'tasks', id), task)
  return { ...task, createdAt: new Date() }
}

export async function getUserTasks(uid: string): Promise<Task[]> {
  const db = getFirestoreDb()
  const q = query(
    collection(db, 'users', uid, 'tasks'),
    where('status', 'in', ['pending', 'in_progress']),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Task)
}

export function subscribeToTasks(uid: string, callback: (tasks: Task[]) => void) {
  const db = getFirestoreDb()
  const q = query(
    collection(db, 'users', uid, 'tasks'),
    where('status', 'in', ['pending', 'in_progress']),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Task))
  })
}

export async function completeTask(uid: string, taskId: string): Promise<void> {
  const db = getFirestoreDb()
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    status: 'done' as TaskStatus,
    completedAt: serverTimestamp(),
  })
}

export async function updateTaskStatus(uid: string, taskId: string, status: TaskStatus) {
  const db = getFirestoreDb()
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), { status })
}

export async function updateTaskMicroSteps(
  uid: string,
  taskId: string,
  microSteps: { id: string; title: string; done: boolean; durationMin?: number }[]
): Promise<void> {
  const db = getFirestoreDb()
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    microSteps,
    breakdownState: 'confirmed',
  })
}

export async function toggleMicroStep(
  uid: string,
  taskId: string,
  stepId: string,
  done: boolean
): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users', uid, 'tasks', taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const task = snap.data()
  const steps = (task.microSteps ?? []).map((s: { id: string; title: string; done: boolean; durationMin?: number }) =>
    s.id === stepId ? { ...s, done } : s
  )
  await updateDoc(ref, { microSteps: steps })
}
