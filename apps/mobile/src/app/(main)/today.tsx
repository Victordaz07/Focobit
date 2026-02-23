import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useTasksStore, useGamificationStore } from '../../stores'
import { subscribeToTasks, completeTask, getGamificationProfile } from '@focobit/firebase-config'
import { EnergyLevel } from '@focobit/shared'

export default function TodayScreen() {
  const { user, profile } = useAuthStore()
  const { tasks, currentEnergy, setTasks, setEnergy, getTodayTasks } = useTasksStore()
  const { profile: gamProfile, setProfile: setGamProfile, level, xpPercent } = useGamificationStore()
  const [crisisMode, setCrisisMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const uid = user?.uid ?? ''
  const todayTasks = getTodayTasks()
  const completedToday = todayTasks.filter(t => t.status === 'done').length

  useEffect(() => {
    if (!uid) { setLoading(false); return }

    // Suscripción realtime a tareas
    const unsub = subscribeToTasks(uid, (newTasks) => {
      setTasks(newTasks)
      setLoading(false)
    })

    // Cargar gamification
    getGamificationProfile(uid).then(gam => {
      if (gam) setGamProfile(gam)
    })

    return unsub
  }, [uid])

  async function handleCompleteTask(taskId: string) {
    if (!uid) return
    await completeTask(uid, taskId)
    // El listener de subscribeToTasks actualiza automáticamente
  }

  const energyOptions: { value: EnergyLevel; label: string; emoji: string }[] = [
    { value: 'low', label: 'Cansado', emoji: '😴' },
    { value: 'medium', label: 'Normal', emoji: '😐' },
    { value: 'high', label: 'Con energía', emoji: '⚡' },
  ]

  const greetingName = profile?.displayName?.split(' ')[0] ?? 'Tú'

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {greetingName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⚡ Nv.{level}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.xpLabel}>{gamProfile?.xp ?? 0} XP</Text>
        </View>

        {/* Energy Check-in */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔋 ¿Cómo estás ahora?</Text>
          <View style={styles.energyRow}>
            {energyOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.energyBtn,
                  currentEnergy === opt.value && styles.energyBtnActive,
                ]}
                onPress={() => setEnergy(opt.value)}
              >
                <Text style={styles.energyEmoji}>{opt.emoji}</Text>
                <Text style={styles.energyLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tareas de hoy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            PARA HOY ({completedToday}/{todayTasks.length})
          </Text>

          {loading ? (
            <ActivityIndicator color="#6C63FF" style={{ marginTop: 24 }} />
          ) : todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
              <Text style={styles.emptyBody}>
                Agrega algo desde la pestaña Tareas
              </Text>
            </View>
          ) : (
            todayTasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, task.status === 'done' && styles.taskDone]}
                onPress={() => handleCompleteTask(task.id)}
              >
                <View style={styles.taskCheck}>
                  <Text style={styles.checkIcon}>
                    {task.status === 'done' ? '✓' : '○'}
                  </Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskTitle,
                    task.status === 'done' && styles.taskTitleDone,
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskMeta}>
                    {task.energyRequired === 'low' ? '🔋 baja' :
                      task.energyRequired === 'medium' ? '🔋🔋 media' : '🔋🔋🔋 alta'}
                    {task.microSteps.length > 0 &&
                      `  ·  ${task.microSteps.filter(s => s.done).length}/${task.microSteps.length} pasos`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Racha */}
        {gamProfile && (
          <View style={styles.streakCard}>
            <Text style={styles.streakText}>
              🔥 Racha: {gamProfile.streakDays} días
            </Text>
            <Text style={styles.streakSub}>
              {gamProfile.streakState === 'paused'
                ? '¡Vuelve pronto para recuperarla!'
                : '¡Sigue así!'}
            </Text>
          </View>
        )}

        {/* Botón crisis */}
        <TouchableOpacity
          style={styles.crisisBtn}
          onPress={() => setCrisisMode(true)}
        >
          <Text style={styles.crisisBtnText}>😵 Estoy saturado</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal Crisis */}
      <Modal visible={crisisMode} transparent animationType="fade">
        <View style={styles.crisisOverlay}>
          <View style={styles.crisisCard}>
            <Text style={styles.crisisWave}>🌊</Text>
            <Text style={styles.crisisTitle}>Respira.</Text>
            <Text style={styles.crisisBody}>
              No tienes que hacer todo ahora.{'\n'}
              Solo necesitas hacer UNA cosa.
            </Text>
            <View style={styles.crisisTask}>
              <Text style={styles.crisisTaskText}>
                {todayTasks.find(t => t.energyRequired === 'low' && t.status === 'pending')
                  ? `💧 ${todayTasks.find(t => t.energyRequired === 'low' && t.status === 'pending')!.title}`
                  : '💧 Tomar un vaso de agua'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.crisisOk}
              onPress={() => setCrisisMode(false)}
            >
              <Text style={styles.crisisOkText}>✓ Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E17' },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  date: { fontSize: 13, color: '#A7A9BE', marginTop: 2, textTransform: 'capitalize' },
  levelBadge: { backgroundColor: '#1E1B3A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  levelText: { color: '#6C63FF', fontWeight: '700', fontSize: 13 },

  xpContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  xpBar: { flex: 1, height: 6, backgroundColor: '#2A2A40', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 3 },
  xpLabel: { color: '#A7A9BE', fontSize: 12, width: 56 },

  card: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 20 },
  cardTitle: { color: '#FFFFFF', fontWeight: '600', marginBottom: 12, fontSize: 15 },
  energyRow: { flexDirection: 'row', gap: 8 },
  energyBtn: {
    flex: 1, alignItems: 'center', padding: 10,
    backgroundColor: '#2A2A40', borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
  },
  energyBtnActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  energyEmoji: { fontSize: 22 },
  energyLabel: { color: '#A7A9BE', fontSize: 11, marginTop: 4 },

  section: { marginBottom: 20 },
  sectionTitle: { color: '#A7A9BE', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },

  taskCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 12,
    padding: 14, marginBottom: 8, gap: 12,
  },
  taskDone: { opacity: 0.5 },
  taskCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  checkIcon: { color: '#6C63FF', fontSize: 14, fontWeight: '700' },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#A7A9BE' },
  taskMeta: { color: '#A7A9BE', fontSize: 12, marginTop: 3 },

  streakCard: {
    backgroundColor: '#1A1A2E', borderRadius: 12,
    padding: 14, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: '#FF9500',
  },
  streakText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  streakSub: { color: '#A7A9BE', fontSize: 12, marginTop: 2 },

  crisisBtn: {
    alignItems: 'center', padding: 16,
    borderWidth: 1, borderColor: '#2A2A40',
    borderRadius: 12, marginTop: 8,
  },
  crisisBtnText: { color: '#A7A9BE', fontSize: 15 },

  crisisOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  crisisCard: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 28, alignItems: 'center', width: '100%',
  },
  crisisWave: { fontSize: 48, marginBottom: 12 },
  crisisTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  crisisBody: { color: '#A7A9BE', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  crisisTask: {
    backgroundColor: '#0F0E17', borderRadius: 12,
    padding: 16, width: '100%', marginBottom: 20,
  },
  crisisTaskText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  crisisOk: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center' },
  crisisOkText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  emptyState: { alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  emptyBody: { color: '#A7A9BE', fontSize: 14, marginTop: 8, textAlign: 'center' },
})
