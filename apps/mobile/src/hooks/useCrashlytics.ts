import { useEffect } from 'react'
import { useAuthStore } from '../stores'

export function useCrashlytics() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    async function setup() {
      try {
        const crashlytics = require('@react-native-firebase/crashlytics')
        const c = crashlytics.default()
        await c.setUserId(uid)
        await c.setAttribute('level', String(1))
        await c.setCrashlyticsCollectionEnabled(true)
      } catch (e) {
        console.warn('Crashlytics not available:', e)
      }
    }
    setup()
  }, [user?.uid])
}
