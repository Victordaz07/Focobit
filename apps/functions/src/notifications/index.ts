import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendNotificationToUser } from '../gamification'

// Cron: cada hora — verifica rachas pausadas y manda recordatorio
export const checkStreaksPaused = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const db = admin.firestore()
    const now = new Date()
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Buscar usuarios con racha en pausa (lastActiveDate entre 24h y 48h)
    const snaps = await db.collectionGroup('gamification')
      .where('streakState', '==', 'active')
      .where('lastActiveDate', '<=', twentyFourHoursAgo)
      .where('lastActiveDate', '>=', fortyEightHoursAgo)
      .get()

    const batch = db.batch()
    const notifications: Promise<void>[] = []

    snaps.forEach(doc => {
      const userId = doc.ref.parent.parent?.id
      if (!userId) return

      // Pasar a estado 'paused'
      batch.update(doc.ref, { streakState: 'paused' })

      // Enviar notificación de recuperación
      notifications.push(
        sendNotificationToUser(userId, {
          title: '⏸ Tu racha está en pausa',
          body: 'Tienes 24h para recuperarla. Una sola acción cuenta. ¡Tú puedes!',
          data: { type: 'streak_paused' },
        })
      )
    })

    await batch.commit()
    await Promise.all(notifications)
    console.log(`Processed ${snaps.size} streak pauses`)
  })

// Cron: cada día a las 8am — recordatorios de rutinas de mañana
export const sendRoutineReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async () => {
    const db = admin.firestore()
    const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const today = DAY_MAP[new Date().getDay()]

    // Buscar todas las rutinas de mañana activas hoy
    const snaps = await db.collectionGroup('routines')
      .where('type', '==', 'morning')
      .where('activeDays', 'array-contains', today)
      .get()

    const notifications: Promise<void>[] = []

    snaps.forEach(doc => {
      const userId = doc.ref.parent.parent?.id
      if (!userId) return
      const routine = doc.data()

      notifications.push(
        sendNotificationToUser(userId, {
          title: '🌅 Rutina de mañana',
          body: `Es hora de "${routine.title}". ¡Empieza el día con energía!`,
          data: { type: 'routine_reminder', routineId: doc.id },
        })
      )
    })

    await Promise.all(notifications)
    console.log(`Sent ${notifications.length} morning routine reminders`)
  })

// Cron: cada día a las 10pm — recordatorio rutina de noche
export const sendNightRoutineReminders = functions.pubsub
  .schedule('0 22 * * *')
  .timeZone('America/Mexico_City')
  .onRun(async () => {
    const db = admin.firestore()
    const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const today = DAY_MAP[new Date().getDay()]

    const snaps = await db.collectionGroup('routines')
      .where('type', '==', 'night')
      .where('activeDays', 'array-contains', today)
      .get()

    const notifications: Promise<void>[] = []

    snaps.forEach(doc => {
      const userId = doc.ref.parent.parent?.id
      if (!userId) return
      const routine = doc.data()

      notifications.push(
        sendNotificationToUser(userId, {
          title: '🌙 Rutina de noche',
          body: `No olvides "${routine.title}" antes de dormir.`,
          data: { type: 'routine_reminder', routineId: doc.id },
        })
      )
    })

    await Promise.all(notifications)
    console.log(`Sent ${notifications.length} night routine reminders`)
  })
