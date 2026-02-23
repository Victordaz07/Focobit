import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Trigger: cuando una tarea se marca como 'done'
export const onTaskCompleted = functions.firestore
  .document('users/{userId}/tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const { userId } = context.params

    // Solo actuar cuando cambia a 'done' y xpAwarded es false
    if (before.status === after.status) return
    if (after.status !== 'done') return
    if (after.xpAwarded === true) return

    const db = admin.firestore()
    const gamRef = db.doc(`users/${userId}/gamification/profile`)
    const gamSnap = await gamRef.get()
    if (!gamSnap.exists) return

    const gam = gamSnap.data()!
    const XP_GAIN = 20
    const COIN_GAIN = 5
    const newXP = (gam.xp ?? 0) + XP_GAIN
    const newCoins = (gam.coins ?? 0) + COIN_GAIN
    const newLevel = Math.floor(newXP / 300) + 1
    const leveledUp = newLevel > (gam.level ?? 1)

    await gamRef.update({
      xp: newXP,
      coins: newCoins,
      level: newLevel,
      totalTasksCompleted: (gam.totalTasksCompleted ?? 0) + 1,
    })

    // Marcar tarea como xpAwarded para evitar doble premio
    await change.after.ref.update({ xpAwarded: true })

    // Actualizar skill 'order'
    const skillsRef = db.doc(`users/${userId}/skills/profile`)
    const skillsSnap = await skillsRef.get()
    if (skillsSnap.exists) {
      const skills = skillsSnap.data()!
      const orderXP = (skills.order?.xp ?? 0) + 10
      const orderLevel = Math.min(5, Math.floor(orderXP / 100) + 1)
      await skillsRef.update({
        'order.xp': orderXP,
        'order.level': orderLevel,
      })
    }

    // Notificar level up si aplica
    if (leveledUp) {
      await sendNotificationToUser(userId, {
        title: '⚡ ¡Subiste de nivel!',
        body: `Ahora eres nivel ${newLevel}. ¡Sigue así!`,
        data: { type: 'level_up', level: String(newLevel) },
      })
    }

    // Actualizar progreso de challenges
    await updateChallengeProgress(userId, 'tasks', 1)
  })

async function updateChallengeProgress(
  userId: string,
  type: string,
  increment: number
): Promise<void> {
  const db = admin.firestore()
  const weekId = getWeekId()
  const ref = db.doc(`users/${userId}/challenges/${weekId}`)
  const snap = await ref.get()
  if (!snap.exists) return

  const data = snap.data()!
  const challenges = (data.challenges ?? []).map((c: { type: string; completed?: boolean; currentCount?: number; targetCount?: number; xpReward?: number; coinReward?: number; title?: string }) => {
    if (c.type === type && !c.completed) {
      const newCount = (c.currentCount ?? 0) + increment
      const completed = newCount >= (c.targetCount ?? 0)
      return { ...c, currentCount: newCount, completed }
    }
    return c
  })

  await ref.update({ challenges })

  // Si alguno se completó, dar recompensa
  const prevChallenges = (data.challenges ?? []) as { completed?: boolean }[]
  const justCompleted = challenges.filter((c: { completed?: boolean }, i: number) =>
    c.completed && !prevChallenges[i]?.completed
  )
  for (const challenge of justCompleted) {
    const gamRef = db.doc(`users/${userId}/gamification/profile`)
    await gamRef.update({
      xp: admin.firestore.FieldValue.increment((challenge as { xpReward?: number }).xpReward ?? 50),
      coins: admin.firestore.FieldValue.increment((challenge as { coinReward?: number }).coinReward ?? 20),
    })
    await sendNotificationToUser(userId, {
      title: '🎯 ¡Reto completado!',
      body: `"${(challenge as { title?: string }).title}" completado. +${(challenge as { xpReward?: number }).xpReward} XP`,
      data: { type: 'challenge_complete' },
    })
  }
}

export async function sendNotificationToUser(
  userId: string,
  notification: { title: string; body: string; data?: Record<string, string> }
): Promise<void> {
  const db = admin.firestore()
  const userSnap = await db.doc(`users/${userId}`).get()
  if (!userSnap.exists) return

  const user = userSnap.data()!
  const token = user.fcmToken
  if (!token) return

  try {
    await admin.messaging().send({
      token,
      notification: { title: notification.title, body: notification.body },
      data: notification.data ?? {},
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      android: { notification: { sound: 'default' } },
    })
  } catch (error) {
    console.error(`FCM error for user ${userId}:`, error)
  }
}

function getWeekId(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}
