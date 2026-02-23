import {
  getFirestoreDb, doc, setDoc, updateDoc, deleteDoc,
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
