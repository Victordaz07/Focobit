import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

export default function RootLayout() {
  const { isAuthenticated, isLoading, profile } = useAuth()
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  )
}
