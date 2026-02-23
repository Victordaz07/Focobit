import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'

export default function SplashScreen() {
  const { isLoading, isAuthenticated, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login')
      } else if (!profile?.onboardingCompleted) {
        router.replace('/(auth)/onboarding')
      } else {
        router.replace('/(main)/today')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isLoading, isAuthenticated, profile])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Focobit</Text>
      <Text style={styles.tagline}>Tu compañero de foco</Text>
      <ActivityIndicator
        size="large"
        color="#6C63FF"
        style={styles.loader}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#A7A9BE',
    marginTop: 8,
  },
  loader: {
    marginTop: 48,
  },
})
