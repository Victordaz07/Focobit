import { getFirestoreDb, doc, setDoc, collection, getDocs } from './firestore'

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  unlockedAt: Date
  category: 'tasks' | 'focus' | 'streak' | 'level' | 'routines' | 'social'
}

export const ACHIEVEMENTS_CATALOG: Omit<Achievement, 'unlockedAt'>[] = [
  // Tareas
  { id: 'first_task',   emoji: '✅', title: 'Primera tarea',     description: 'Completa tu primera tarea',        category: 'tasks' },
  { id: 'tasks_5',      emoji: '💪', title: '5 tareas',          description: 'Completa 5 tareas en total',       category: 'tasks' },
  { id: 'tasks_10',     emoji: '🏆', title: '10 tareas',         description: 'Completa 10 tareas en total',      category: 'tasks' },
  { id: 'tasks_50',     emoji: '⭐', title: '50 tareas',         description: 'Completa 50 tareas en total',      category: 'tasks' },
  // Focus
  { id: 'first_focus',  emoji: '⏱', title: 'Primera sesión',    description: 'Completa tu primera sesión focus', category: 'focus' },
  { id: 'focus_5',      emoji: '🧠', title: '5 sesiones',        description: 'Completa 5 sesiones focus',        category: 'focus' },
  { id: 'focus_20',     emoji: '🎯', title: '20 sesiones',       description: 'Completa 20 sesiones focus',       category: 'focus' },
  { id: 'focus_deep',   emoji: '🌊', title: 'Flujo profundo',    description: 'Completa un focus de 25 minutos',  category: 'focus' },
  // Racha
  { id: 'streak_3',     emoji: '🔥', title: 'Racha de 3 días',   description: 'Mantén una racha de 3 días',       category: 'streak' },
  { id: 'streak_7',     emoji: '🔥🔥', title: 'Semana completa', description: 'Mantén una racha de 7 días',       category: 'streak' },
  { id: 'streak_30',    emoji: '💎', title: 'Mes constante',     description: 'Mantén una racha de 30 días',      category: 'streak' },
  { id: 'recovered',    emoji: '💜', title: 'Vuelta al ruedo',   description: 'Recupera tu racha después de pausa', category: 'streak' },
  // Nivel
  { id: 'level_3',      emoji: '⚡', title: 'Nivel 3',           description: 'Alcanza el nivel 3',               category: 'level' },
  { id: 'level_5',      emoji: '🌟', title: 'Nivel 5',           description: 'Alcanza el nivel 5',               category: 'level' },
  { id: 'level_10',     emoji: '👑', title: 'Nivel 10',          description: 'Alcanza el nivel 10',              category: 'level' },
  // Rutinas
  { id: 'first_routine',emoji: '🔄', title: 'Primera rutina',    description: 'Completa tu primera rutina',       category: 'routines' },
  { id: 'routine_7',    emoji: '📅', title: 'Rutina semanal',    description: 'Completa la misma rutina 7 veces', category: 'routines' },
  // Crisis
  { id: 'crisis_mode',  emoji: '🌊', title: 'Sobreviviste',      description: 'Usaste el modo crisis y volviste', category: 'social' },
  { id: 'challenge_1',  emoji: '🎯', title: 'Primer reto',       description: 'Completa tu primer reto semanal',  category: 'tasks' },
  { id: 'coins_100',    emoji: '🪙', title: '100 monedas',       description: 'Acumula 100 monedas',              category: 'level' },
]

export async function getUnlockedAchievements(uid: string): Promise<Achievement[]> {
  const db = getFirestoreDb()
  const snap = await getDocs(collection(db, 'users', uid, 'achievements'))
  return snap.docs.map(d => d.data() as Achievement)
}

export async function checkAndUnlockAchievements(
  uid: string,
  stats: {
    totalTasks: number
    totalFocus: number
    streakDays: number
    streakState: string
    level: number
    totalRoutines: number
    coins: number
    usedCrisisMode?: boolean
    completedChallenge?: boolean
  }
): Promise<Achievement[]> {
  const db = getFirestoreDb()
  const unlockedSnap = await getDocs(collection(db, 'users', uid, 'achievements'))
  const alreadyUnlocked = new Set(unlockedSnap.docs.map(d => d.id))
  const newlyUnlocked: Achievement[] = []

  const checks: { id: string; condition: boolean }[] = [
    { id: 'first_task',    condition: stats.totalTasks >= 1 },
    { id: 'tasks_5',       condition: stats.totalTasks >= 5 },
    { id: 'tasks_10',      condition: stats.totalTasks >= 10 },
    { id: 'tasks_50',      condition: stats.totalTasks >= 50 },
    { id: 'first_focus',   condition: stats.totalFocus >= 1 },
    { id: 'focus_5',       condition: stats.totalFocus >= 5 },
    { id: 'focus_20',      condition: stats.totalFocus >= 20 },
    { id: 'streak_3',      condition: stats.streakDays >= 3 },
    { id: 'streak_7',      condition: stats.streakDays >= 7 },
    { id: 'streak_30',     condition: stats.streakDays >= 30 },
    { id: 'recovered',     condition: stats.streakState === 'recovered' },
    { id: 'level_3',       condition: stats.level >= 3 },
    { id: 'level_5',       condition: stats.level >= 5 },
    { id: 'level_10',      condition: stats.level >= 10 },
    { id: 'first_routine', condition: stats.totalRoutines >= 1 },
    { id: 'coins_100',     condition: stats.coins >= 100 },
    { id: 'crisis_mode',   condition: stats.usedCrisisMode === true },
    { id: 'challenge_1',   condition: stats.completedChallenge === true },
  ]

  for (const check of checks) {
    if (!check.condition || alreadyUnlocked.has(check.id)) continue
    const catalog = ACHIEVEMENTS_CATALOG.find(a => a.id === check.id)
    if (!catalog) continue

    const achievement: Achievement = {
      ...catalog,
      unlockedAt: new Date(),
    }

    await setDoc(
      doc(db, 'users', uid, 'achievements', check.id),
      { ...achievement, unlockedAt: new Date().toISOString() }
    )
    newlyUnlocked.push(achievement)
  }

  return newlyUnlocked
}
