import { useEffect } from 'react'
import { usePathname } from 'expo-router'

let rnAnalytics: ReturnType<typeof import('@react-native-firebase/analytics').default> | null = null

function getRNAnalytics() {
  if (rnAnalytics) return rnAnalytics
  try {
    const mod = require('@react-native-firebase/analytics')
    rnAnalytics = mod.default()
    return rnAnalytics
  } catch {
    return null
  }
}

export async function trackEvent(name: string, params?: Record<string, unknown>) {
  const analytics = getRNAnalytics()
  if (!analytics) return
  await analytics.logEvent(name, params as Record<string, string>)
}

export async function trackScreen(screenName: string) {
  const analytics = getRNAnalytics()
  if (!analytics) return
  await analytics.logScreenView({ screen_name: screenName, screen_class: screenName })
}

export async function setAnalyticsUser(uid: string) {
  const analytics = getRNAnalytics()
  if (!analytics) return
  await analytics.setUserId(uid)
}

export async function trackCrash(message: string, fatal = false) {
  try {
    const crashlytics = require('@react-native-firebase/crashlytics')
    const c = crashlytics.default()
    await c.log(message)
    if (fatal) await c.recordError(new Error(message))
  } catch {
    // Crashlytics not available
  }
}

// Hook para tracking automático de pantallas
export function useScreenTracking() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname) return
    const screenName = pathname.replace('/(main)/', '').replace('/(auth)/', '')
    trackScreen(screenName)
  }, [pathname])
}
