import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as QuickActions from 'expo-quick-actions'
import { useAuthStore } from '../stores'
import { trackEvent } from './useAnalytics'

export function useSiriShortcuts() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (Platform.OS !== 'ios' || !user) return
    setupShortcuts()
  }, [user?.uid])

  async function setupShortcuts() {
    try {
      await QuickActions.setItems([
        {
          id: 'add_task',
          title: 'Nueva tarea',
          subtitle: 'Agregar tarea rápida a Focobit',
          icon: 'add',
          params: { action: 'add_task' },
        },
        {
          id: 'start_focus',
          title: 'Iniciar Focus',
          subtitle: 'Empezar sesión de foco',
          icon: 'time',
          params: { action: 'start_focus' },
        },
        {
          id: 'check_in',
          title: 'Check-in de energía',
          subtitle: 'Registrar energía del día',
          icon: 'task',
          params: { action: 'check_in' },
        },
        {
          id: 'crisis_mode',
          title: 'Modo Crisis',
          subtitle: 'Activar modo para días difíciles',
          icon: 'love',
          params: { action: 'crisis_mode' },
        },
      ])
    } catch (e) {
      console.warn('Siri Shortcuts no disponible:', e)
    }
  }
}

// Handler para procesar la acción cuando se abre desde un shortcut
export async function handleSiriAction(action: string, router: { push: (path: string) => void }) {
  await trackEvent('siri_shortcut_used', { action })
  switch (action) {
    case 'add_task':
      router.push('/(main)/tasks?action=new')
      break
    case 'start_focus':
      router.push('/(main)/focus?action=start')
      break
    case 'check_in':
      router.push('/(main)/today?action=checkin')
      break
    case 'crisis_mode':
      router.push('/(main)/today?action=crisis')
      break
  }
}
