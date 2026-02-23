import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const CHALLENGE_POOL = [
  { id: 'c1', title: '3 días con 1 acción mínima', type: 'active_days', targetCount: 3, xpReward: 60, coinReward: 25 },
  { id: 'c2', title: '5 sesiones de focus', type: 'focus', targetCount: 5, xpReward: 80, coinReward: 30 },
  { id: 'c3', title: 'Completa 10 micro pasos', type: 'microSteps', targetCount: 10, xpReward: 50, coinReward: 20 },
  { id: 'c4', title: '3 rutinas de mañana', type: 'routines', targetCount: 3, xpReward: 70, coinReward: 28 },
  { id: 'c5', title: 'Haz check-in 4 días', type: 'checkIns', targetCount: 4, xpReward: 40, coinReward: 15 },
  { id: 'c6', title: 'Completa 5 tareas', type: 'tasks', targetCount: 5, xpReward: 65, coinReward: 22 },
  { id: 'c7', title: '2 sesiones de focus de 15+ min', type: 'focus_long', targetCount: 2, xpReward: 90, coinReward: 35 },
]

// Cron: cada lunes a las 00:01 — genera retos de la semana para todos los usuarios
export const onWeeklyChallengeTick = functions.pubsub
  .schedule('1 0 * * 1')
  .timeZone('America/Mexico_City')
  .onRun(async () => {
    const db = admin.firestore()
    const weekId = getWeekId()

    // Obtener todos los usuarios
    const usersSnap = await db.collection('users').get()
    const batch = db.batch()

    usersSnap.forEach(userDoc => {
      // Seleccionar 3 retos random
      const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 3).map(c => ({
        ...c,
        currentCount: 0,
        completed: false,
      }))

      const challengeRef = db.doc(`users/${userDoc.id}/challenges/${weekId}`)
      batch.set(challengeRef, {
        weekId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        challenges: selected,
      })
    })

    await batch.commit()
    console.log(`Generated weekly challenges for ${usersSnap.size} users, week ${weekId}`)
  })

// Función HTTP para generar retos manualmente (útil para nuevos usuarios)
export const generateChallengesForUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required')

  const db = admin.firestore()
  const weekId = getWeekId()
  const userId = context.auth.uid

  // Verificar si ya tiene retos esta semana
  const existing = await db.doc(`users/${userId}/challenges/${weekId}`).get()
  if (existing.exists) return { weekId, challenges: existing.data()!.challenges }

  const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3).map(c => ({
    ...c,
    currentCount: 0,
    completed: false,
  }))

  await db.doc(`users/${userId}/challenges/${weekId}`).set({
    weekId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    challenges: selected,
  })

  return { weekId, challenges: selected }
})

function getWeekId(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}
