import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuthStore, useThemeStore } from '../../stores'
import { getFirestoreDb, doc, updateDoc, COLLECTIONS, signOutUser } from '@focobit/firebase-config'
import { trackEvent } from '../../hooks/useAnalytics'
import type { AppTheme } from '@focobit/shared'

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, padding: 20, paddingTop: 56 },
    heading: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 24 },
    section: { backgroundColor: theme.surface, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: theme.textMuted, letterSpacing: 1, padding: 16, paddingBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.surface2 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowEmoji: { fontSize: 22, width: 32 },
    rowTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
    rowSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
    rowArrow: { color: theme.textMuted, fontSize: 16 },
  })
}

export default function SettingsScreen() {
  const { user, reset } = useAuthStore()
  const { theme } = useThemeStore()
  const s = createStyles(theme)

  async function handleLinkAlexa() {
    Alert.alert(
      'Vincular Alexa',
      'Para vincular Alexa necesitas activar la Skill "Focobit" en tu app de Amazon Alexa y luego volver aquí.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ya activé la Skill',
          onPress: async () => {
            if (!user) return
            const db = getFirestoreDb()
            await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
              alexaLinked: true,
              alexaLinkedAt: Date.now(),
            })
            await trackEvent('alexa_linked')
            Alert.alert('¡Vinculado! 🎙️', 'Ya puedes usar Focobit con Alexa.')
          },
        },
      ]
    )
  }

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await signOutUser(); reset() } },
    ])
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>Ajustes</Text>

      {/* Integraciones */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>INTEGRACIONES</Text>

        <TouchableOpacity style={s.row} onPress={handleLinkAlexa}>
          <View style={s.rowLeft}>
            <Text style={s.rowEmoji}>🎙️</Text>
            <View>
              <Text style={s.rowTitle}>Amazon Alexa</Text>
              <Text style={s.rowSub}>Gestiona tareas con tu voz</Text>
            </View>
          </View>
          <Text style={s.rowArrow}>→</Text>
        </TouchableOpacity>

        <View style={s.row}>
          <View style={s.rowLeft}>
            <Text style={s.rowEmoji}>⌚</Text>
            <View>
              <Text style={s.rowTitle}>Apple Watch</Text>
              <Text style={s.rowSub}>
                {user ? 'Abre la app Watch para conectar' : 'Inicia sesión primero'}
              </Text>
            </View>
          </View>
          <Text style={{ color: theme.green, fontSize: 13, fontWeight: '600' }}>Auto</Text>
        </View>
      </View>

      {/* Cuenta */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>CUENTA</Text>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Text style={s.rowEmoji}>👤</Text>
            <View>
              <Text style={s.rowTitle}>{user?.email ?? '—'}</Text>
              <Text style={s.rowSub}>Usuario ID: {user?.uid?.slice(0, 8)}...</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={handleSignOut}>
          <View style={s.rowLeft}>
            <Text style={s.rowEmoji}>🚪</Text>
            <Text style={[s.rowTitle, { color: theme.danger }]}>Cerrar sesión</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}
