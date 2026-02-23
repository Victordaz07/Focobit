import { useEffect } from 'react'
import {
  onAuthChanged,
  getFirestoreDb,
  doc,
  getDoc,
  COLLECTIONS,
} from '@focobit/firebase-config'
import { UserProfile } from '@focobit/shared'
import { useAuthStore } from '../stores/auth.store'

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated, setUser, setProfile } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Cargar perfil de Firestore
        try {
          const db = getFirestoreDb()
          const profileRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
          const snap = await getDoc(profileRef)
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile)
          }
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return unsubscribe
  }, [])

  return { user, profile, isLoading, isAuthenticated }
}
