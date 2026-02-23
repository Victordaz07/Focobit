import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useTasksStore, useGamificationStore, useChallengesStore, useOfflineStore, useThemeStore } from '../../stores'
import { useChallenges } from '../../hooks'
import { subscribeToTasks, completeTask, getGamificationProfile } from '@focobit/firebase-config'
import { EnergyLevel, type AppTheme } from '@focobit/shared'

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { padding: 20, paddingTop: 56, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    greeting: { fontSize: 22, fontWeight: '700', color: theme.text },
    date: { fontSize: 13, color: theme.textMuted, marginTop: 2, textTransform: 'capitalize' },
    levelBadge: { backgroundColor: theme.accentDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    levelText: { color: theme.accent, fontWeight: '700', fontSize: 13 },
    xpContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    xpBar: { flex: 1, height: 6, backgroundColor: theme.surface2, borderRadius: 3, overflow: 'hidden' },
    xpFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 3 },
    xpLabel: { color: theme.textMuted, fontSize: 12, width: 56 },
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
    cardTitle: { color: theme.text, fontWeight: '600', marginBottom: 12, fontSize: 15 },
    energyRow: { flexDirection: 'row', gap: 8 },
    energyBtn: {
      flex: 1, alignItems: 'center', padding: 10,
      backgroundColor: theme.surface2, borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
    },
    energyBtnActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
    energyEmoji: { fontSize: 22 },
    energyLabel: { color: theme.textMuted, fontSize: 11, marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    taskCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: 12,
      padding: 14, marginBottom: 8, gap: 12,
    },
    taskDone: { opacity: 0.5 },
    taskCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    checkIcon: { color: theme.accent, fontSize: 14, fontWeight: '700' },
    taskInfo: { flex: 1 },
    taskTitle: { color: theme.text, fontSize: 15, fontWeight: '600' },
    taskTitleDone: { textDecorationLine: 'line-through', color: theme.textMuted },
    taskMeta: { color: theme.textMuted, fontSize: 12, marginTop: 3 },
    streakCard: {
      backgroundColor: theme.surface, borderRadius: 12,
      padding: 14, marginBottom: 16,
      borderLeftWidth: 3, borderLeftColor: theme.accent,
    },
    streakText: { color: theme.text, fontWeight: '700', fontSize: 15 },
    streakSub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
    crisisBtn: {
      alignItems: 'center', padding: 16,
      borderWidth: 1, borderColor: theme.surface2,
      borderRadius: 12, marginTop: 8,
    },
    crisisBtnText: { color: theme.textMuted, fontSize: 15 },
    crisisOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    },
    crisisCard: {
      backgroundColor: theme.surface, borderRadius: 20,
      padding: 28, alignItems: 'center', width: '100%',
    },
    crisisWave: { fontSize: 48, marginBottom: 12 },
    crisisTitle: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 8 },
    crisisBody: { color: theme.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
    crisisTask: {
      backgroundColor: theme.bg, borderRadius: 12,
      padding: 16, width: '100%', marginBottom: 20,
    },
    crisisTaskText: { color: theme.text, fontSize: 16, textAlign: 'center' },
    crisisOk: { backgroundColor: theme.accent, borderRadius: 12, padding: 14, width: '100%', alignItems: 'center' },
    crisisOkText: { color: theme.text, fontWeight: '700', fontSize: 16 },
    offlineBanner: { backgroundColor: '#FF9500', paddingHorizontal: 20, paddingVertical: 8 },
    offlineBannerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    emptyState: { alignItems: 'center', padding: 32 },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
    emptyBody: { color: theme.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  })
}

export default function TodayScreen() {
  const { theme } = useThemeStore()
  const s = createStyles(theme)
  const { user, profile } = useAuthStore()
  const { tasks, currentEnergy, setTasks, setEnergy, getTodayTasks } = useTasksStore()
  const { isOnline, pendingCount, isSyncing } = useOfflineStore()
  const { profile: gamProfile, setProfile: setGamProfile, level, xpPercent } = useGamificationStore()
  const [crisisMode, setCrisisMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const { newAchievements, clearNewAchievements } = useChallengesStore()
  const latestAchievement = newAchievements[0] ?? null
  useChallenges()

  const uid = user?.uid ?? ''
  const todayTasks = getTodayTasks()
  const completedToday = todayTasks.filter(t => t.status === 'done').length

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    const unsub = subscribeToTasks(uid, (newTasks) => {
      setTasks(newTasks)
      setLoading(false)
    })
    getGamificationProfile(uid).then(gam => {
      if (gam) setGamProfile(gam)
    })
    return unsub
  }, [uid])

  async function handleCompleteTask(taskId: string) {
    if (!uid) return
    await completeTask(uid, taskId)
  }

  const energyOptions: { value: EnergyLevel; label: string; emoji: string }[] = [
    { value: 'low', label: 'Cansado', emoji: '😴' },
    { value: 'medium', label: 'Normal', emoji: '😐' },
    { value: 'high', label: 'Con energía', emoji: '⚡' },
  ]

  const greetingName = profile?.displayName?.split(' ')[0] ?? 'Tú'

  return (
    <View style={s.container}>
      {(!isOnline || pendingCount > 0) && (
        <View style={s.offlineBanner}>
          <Text style={s.offlineBannerText}>
            {isSyncing ? '🔄 Sincronizando...' : !isOnline ? '📵 Sin conexión — tus cambios se guardarán al volver' : `⏳ ${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}`}
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hola, {greetingName} 👋</Text>
            <Text style={s.date}>
              {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <View style={s.levelBadge}>
            <Text style={s.levelText}>⚡ Nv.{level}</Text>
          </View>
        </View>

        <View style={s.xpContainer}>
          <View style={s.xpBar}>
            <View style={[s.xpFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={s.xpLabel}>{gamProfile?.xp ?? 0} XP</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>🔋 ¿Cómo estás ahora?</Text>
          <View style={s.energyRow}>
            {energyOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[s.energyBtn, currentEnergy === opt.value && s.energyBtnActive]}
                onPress={() => setEnergy(opt.value)}
              >
                <Text style={s.energyEmoji}>{opt.emoji}</Text>
                <Text style={s.energyLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>PARA HOY ({completedToday}/{todayTasks.length})</Text>
          {loading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
          ) : todayTasks.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={s.emptyTitle}>Sin tareas pendientes</Text>
              <Text style={s.emptyBody}>Agrega algo desde la pestaña Tareas</Text>
            </View>
          ) : (
            todayTasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[s.taskCard, task.status === 'done' && s.taskDone]}
                onPress={() => handleCompleteTask(task.id)}
              >
                <View style={s.taskCheck}>
                  <Text style={s.checkIcon}>{task.status === 'done' ? '✓' : '○'}</Text>
                </View>
                <View style={s.taskInfo}>
                  <Text style={[s.taskTitle, task.status === 'done' && s.taskTitleDone]}>{task.title}</Text>
                  <Text style={s.taskMeta}>
                    {task.energyRequired === 'low' ? '🔋 baja' : task.energyRequired === 'medium' ? '🔋🔋 media' : '🔋🔋🔋 alta'}
                    {task.microSteps.length > 0 && `  ·  ${task.microSteps.filter(st => st.done).length}/${task.microSteps.length} pasos`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {gamProfile && (
          <View style={s.streakCard}>
            <Text style={s.streakText}>🔥 Racha: {gamProfile.streakDays} días</Text>
            <Text style={s.streakSub}>
              {gamProfile.streakState === 'paused' ? '¡Vuelve pronto para recuperarla!' : '¡Sigue así!'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={s.crisisBtn} onPress={() => setCrisisMode(true)}>
          <Text style={s.crisisBtnText}>😵 Estoy saturado</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!latestAchievement} transparent animationType="fade">
        <View style={s.crisisOverlay}>
          <View style={s.crisisCard}>
            <Text style={{ fontSize: 56, marginBottom: 8 }}>{latestAchievement?.emoji ?? '🏆'}</Text>
            <Text style={s.crisisTitle}>¡Logro desbloqueado!</Text>
            <Text style={[s.crisisBody, { fontSize: 18, color: theme.accent, fontWeight: '700' }]}>{latestAchievement?.title}</Text>
            <Text style={s.crisisBody}>{latestAchievement?.description}</Text>
            <TouchableOpacity style={s.crisisOk} onPress={clearNewAchievements}>
              <Text style={s.crisisOkText}>¡Genial! 🎉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={crisisMode} transparent animationType="fade">
        <View style={s.crisisOverlay}>
          <View style={s.crisisCard}>
            <Text style={s.crisisWave}>🌊</Text>
            <Text style={s.crisisTitle}>Respira.</Text>
            <Text style={s.crisisBody}>
              No tienes que hacer todo ahora.{'\n'}Solo necesitas hacer UNA cosa.
            </Text>
            <View style={s.crisisTask}>
              <Text style={s.crisisTaskText}>
                {todayTasks.find(t => t.energyRequired === 'low' && t.status === 'pending')
                  ? `💧 ${todayTasks.find(t => t.energyRequired === 'low' && t.status === 'pending')!.title}`
                  : '💧 Tomar un vaso de agua'}
              </Text>
            </View>
            <TouchableOpacity style={s.crisisOk} onPress={() => setCrisisMode(false)}>
              <Text style={s.crisisOkText}>✓ Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
