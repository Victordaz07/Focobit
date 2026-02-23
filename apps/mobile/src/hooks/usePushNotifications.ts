import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { getFirestoreDb, doc, updateDoc } from '@focobit/firebase-config'
import { COLLECTIONS } from '@focobit/firebase-config'
import { useAuthStore } from '../stores'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function usePushNotifications() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.uid) return
    registerForPushNotifications(user.uid)
  }, [user?.uid])
}

async function registerForPushNotifications(uid: string): Promise<void> {
  if (!Device.isDevice) return

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return

  // Usar getDevicePushTokenAsync para token FCM (compatible con Firebase Cloud Messaging)
  const tokenData = await Notifications.getDevicePushTokenAsync()
  const token = tokenData.data

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  // Guardar token en Firestore
  try {
    const db = getFirestoreDb()
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { fcmToken: token })
  } catch (e) {
    console.error('Error saving FCM token:', e)
  }
}
