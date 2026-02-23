import { useEffect } from 'react'
import { useAuthStore, useThemeStore } from '../stores'
import { getUserStoreData } from '@focobit/firebase-config'

export function useThemeSync() {
  const { user } = useAuthStore()
  const { setTheme } = useThemeStore()

  useEffect(() => {
    if (!user?.uid) return
    getUserStoreData(user.uid).then(data => {
      if (data.equippedTheme) setTheme(data.equippedTheme)
    })
  }, [user?.uid, setTheme])
}
