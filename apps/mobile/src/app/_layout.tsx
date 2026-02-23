import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import type { Action } from 'expo-quick-actions'
import { useQuickActionCallback } from 'expo-quick-actions/hooks'
import { useAuth, usePushNotifications, useNetworkSync, useScreenTracking, useCrashlytics, useThemeSync, useSiriShortcuts, handleSiriAction } from '../hooks'

export default function RootLayout() {
  const { isAuthenticated, isLoading, profile } = useAuth()
  usePushNotifications()
  useNetworkSync()
  useScreenTracking()
  useCrashlytics()
  useThemeSync()
  useSiriShortcuts()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return

    const inAuth = segments[0] === '(auth)'
    const inMain = segments[0] === '(main)'

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/splash')
      return
    }

    if (isAuthenticated && !profile?.onboardingCompleted && !inAuth) {
      router.replace('/(auth)/onboarding')
      return
    }

    if (isAuthenticated && profile?.onboardingCompleted && inAuth) {
      router.replace('/(main)/today')
    }
  }, [isAuthenticated, isLoading, profile, segments])

  useQuickActionCallback((action: Action | null) => {
    if (!isAuthenticated || !profile?.onboardingCompleted) return
    const actionId = action?.params?.action as string | undefined
    if (actionId) handleSiriAction(actionId, router)
  })

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  )
}
