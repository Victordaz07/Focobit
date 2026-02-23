import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
} from 'react-native'
import { useAuthStore, useTasksStore, useFocusStore, useGamificationStore } from '../../stores'
import {
  startFocusSession, completeFocusSession,
  abandonFocusSession, awardXPForAction, updateStreak,
} from '@focobit/firebase-config'
import { FocusDuration } from '@focobit/shared'

const DURATIONS: FocusDuration[] = [5, 10, 15, 20, 25]

export default function FocusScreen() {
  const { user } = useAuthStore()
  const { tasks } = useTasksStore()
  const focus = useFocusStore()
  const { setProfile } = useGamificationStore()
  const [showReward, setShowReward] = useState(false)
  const [reward, setReward] = useState({ xpGained: 0, coinsGained: 0, leveledUp: false })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const uid = user?.uid ?? ''
  const pendingTasks = tasks.filter(t => t.status === 'pending')

  // Timer
  useEffect(() => {
    if (focus.state === 'running') {
      intervalRef.current = setInterval(() => {
        focus.tick()
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [focus.state])

  // Auto-complete cuando llega a 0
  useEffect(() => {
    if (focus.secondsLeft === 0 && focus.state === 'completed' && !completedRef.current) {
      completedRef.current = true
      handleSessionComplete()
    }
  }, [focus.secondsLeft, focus.state])

  async function handleStart() {
    if (!uid) return
    const sessionId = await startFocusSession(uid, {
      durationMin: focus.duration,
      linkedTaskId: focus.linkedTaskId ?? undefined,
    })
    focus.startSession(sessionId)
  }

  async function handleSessionComplete() {
    if (!uid || !focus.sessionId) return
    await completeFocusSession(uid, focus.sessionId)
    const result = await awardXPForAction(uid, 'focusSession')
    await updateStreak(uid)
    setReward(result)
    setShowReward(true)
  }

  async function handleAbandon() {
    if (!uid || !focus.sessionId) return
    await abandonFocusSession(uid, focus.sessionId)
    focus.abandon()
    focus.reset()
    completedRef.current = false
  }

  function handleRewardClose() {
    setShowReward(false)
    focus.reset()
    completedRef.current = false
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progressPercent = focus.state !== 'idle'
    ? ((focus.duration * 60 - focus.secondsLeft) / (focus.duration * 60)) * 100
    : 0

  // ── IDLE: selector ────────────────────────────────────────────────────────
  if (focus.state === 'idle') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.heading}>Modo Focus</Text>
          <Text style={styles.sub}>¿Cuánto tiempo?</Text>

          <View style={styles.durationGrid}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, focus.duration === d && styles.durationBtnActive]}
                onPress={() => focus.setDuration(d)}
              >
                <Text style={[styles.durationNum, focus.duration === d && styles.durationNumActive]}>
                  {d}
                </Text>
                <Text style={[styles.durationMin, focus.duration === d && styles.durationMinActive]}>
                  min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sub}>¿Para qué tarea? (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
            <TouchableOpacity
              style={[styles.taskChip, !focus.linkedTaskId && styles.taskChipActive]}
              onPress={() => focus.setLinkedTask(null)}
            >
              <Text style={[styles.taskChipText, !focus.linkedTaskId && styles.taskChipTextActive]}>
                Sin tarea específica
              </Text>
            </TouchableOpacity>
            {pendingTasks.slice(0, 6).map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.taskChip, focus.linkedTaskId === t.id && styles.taskChipActive]}
                onPress={() => focus.setLinkedTask(t.id)}
              >
                <Text style={[styles.taskChipText, focus.linkedTaskId === t.id && styles.taskChipTextActive]}>
                  {t.title.length > 28 ? t.title.slice(0, 28) + '...' : t.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>▶ Iniciar Focus</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  // ── RUNNING / PAUSED: timer ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>

        <Text style={styles.timerLabel}>
          {focus.state === 'paused' ? '⏸ EN PAUSA' : '🎯 ENFOCADO'}
        </Text>

        {focus.linkedTaskId && (
          <Text style={styles.timerTask}>
            {tasks.find(t => t.id === focus.linkedTaskId)?.title ?? ''}
          </Text>
        )}

        <Text style={styles.timerDisplay}>
          {formatTime(focus.secondsLeft)}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.xpHint}>+15 XP al terminar</Text>

        <Text style={styles.motivational}>
          {focus.state === 'paused'
            ? 'Cuando estés listo, continúa. 💙'
            : motivationalPhrase(focus.duration)}
        </Text>

        <View style={styles.timerActions}>
          {focus.state === 'running' ? (
            <TouchableOpacity style={styles.pauseBtn} onPress={focus.pause}>
              <Text style={styles.pauseBtnText}>⏸ Pausar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeBtn} onPress={focus.resume}>
              <Text style={styles.resumeBtnText}>▶ Continuar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.abandonBtn} onPress={handleAbandon}>
            <Text style={styles.abandonBtnText}>✕ Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal recompensa */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardCard}>
            <Text style={styles.rewardEmoji}>🎉</Text>
            <Text style={styles.rewardTitle}>¡Lo lograste!</Text>
            <Text style={styles.rewardSub}>
              Sesión de {focus.duration} minutos completada
            </Text>
            <View style={styles.rewardRow}>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>+{reward.xpGained} XP</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>+{reward.coinsGained} 🪙</Text>
              </View>
            </View>
            {reward.leveledUp && (
              <Text style={styles.levelUp}>⚡ ¡Subiste de nivel!</Text>
            )}
            <TouchableOpacity
              style={styles.rewardBtn}
              onPress={handleRewardClose}
            >
              <Text style={styles.rewardBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function motivationalPhrase(duration: FocusDuration): string {
  const phrases: Record<FocusDuration, string> = {
    5: 'Solo 5 minutos. Tú puedes. 💪',
    10: 'Un paso a la vez. 🚶',
    15: 'Estás construyendo algo. 🧱',
    20: 'Enfoque profundo activado. 🎯',
    25: 'Modo pro. ¡A por ello! 🔥',
  }
  return phrases[duration]
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E17' },
  scroll: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  heading: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  sub: { color: '#A7A9BE', fontSize: 15, marginBottom: 16, marginTop: 8 },

  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  durationBtn: {
    width: '28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 16, borderWidth: 2, borderColor: '#2A2A40',
  },
  durationBtnActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  durationNum: { fontSize: 28, fontWeight: '800', color: '#A7A9BE' },
  durationNumActive: { color: '#6C63FF' },
  durationMin: { fontSize: 12, color: '#A7A9BE' },
  durationMinActive: { color: '#6C63FF' },

  taskScroll: { marginBottom: 24 },
  taskChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#2A2A40', marginRight: 8,
  },
  taskChipActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  taskChipText: { color: '#A7A9BE', fontSize: 13 },
  taskChipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  startBtn: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  startBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  // Timer
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  timerLabel: { color: '#A7A9BE', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  timerTask: { color: '#6C63FF', fontSize: 15, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  timerDisplay: { fontSize: 80, fontWeight: '800', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  progressBar: { width: '80%', height: 8, backgroundColor: '#2A2A40', borderRadius: 4, overflow: 'hidden', marginTop: 20 },
  progressFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
  xpHint: { color: '#6C63FF', fontSize: 14, fontWeight: '600', marginTop: 12 },
  motivational: { color: '#A7A9BE', fontSize: 15, marginTop: 8, textAlign: 'center' },

  timerActions: { flexDirection: 'row', gap: 12, marginTop: 40 },
  pauseBtn: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#2A2A40' },
  pauseBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  resumeBtn: { flex: 1, backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  resumeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  abandonBtn: { paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 2, borderColor: '#2A2A40', alignItems: 'center' },
  abandonBtnText: { color: '#A7A9BE', fontWeight: '700', fontSize: 16 },

  // Reward modal
  rewardOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  rewardCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' },
  rewardEmoji: { fontSize: 56, marginBottom: 12 },
  rewardTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  rewardSub: { color: '#A7A9BE', fontSize: 15, marginBottom: 20 },
  rewardRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  rewardBadge: { backgroundColor: '#6C63FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  rewardBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  levelUp: { color: '#FFD700', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  rewardBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', marginTop: 8 },
  rewardBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
})
