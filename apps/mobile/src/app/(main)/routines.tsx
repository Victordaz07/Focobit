import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useRoutinesStore, useThemeStore } from '../../stores'
import {
  subscribeToRoutines, createRoutine,
  completeRoutineStep, completeRoutine, deleteRoutine,
  awardXPForAction, updateStreak,
} from '@focobit/firebase-config'
import { Routine, RoutineType, DayOfWeek, CreateRoutineInput, type AppTheme } from '@focobit/shared'

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'L', tue: 'M', wed: 'X', thu: 'J',
  fri: 'V', sat: 'S', sun: 'D',
}
const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 56 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    heading: { fontSize: 24, fontWeight: '800', color: theme.text },
    addBtn: { backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    addBtnText: { color: theme.text, fontWeight: '700', fontSize: 14 },
    scroll: { padding: 20, paddingTop: 0, paddingBottom: 48 },
    section: { marginBottom: 24 },
    sectionTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    routineCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 10 },
    routineTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    routineTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
    routineStreak: { color: '#FF9500', fontSize: 13, fontWeight: '700' },
    routineMeta: { color: theme.textMuted, fontSize: 12, marginBottom: 10 },
    routineProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routineProgressBar: { flex: 1, height: 6, backgroundColor: theme.surface2, borderRadius: 3, overflow: 'hidden' },
    routineProgressFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 3 },
    routineProgressLabel: { color: theme.textMuted, fontSize: 12, width: 32, textAlign: 'right' },
    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptySub: { color: theme.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    emptyBtn: { backgroundColor: theme.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: theme.text, fontWeight: '700' },
  })
}

function createModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sheetTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    closeBtn: { color: theme.textMuted, fontSize: 20, padding: 4 },
    streakText: { color: '#FF9500', fontWeight: '700', fontSize: 14 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    progressBar: { flex: 1, height: 8, backgroundColor: theme.surface2, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 4 },
    progressLabel: { color: theme.textMuted, fontSize: 13, width: 36, textAlign: 'right' },
    stepList: { maxHeight: 280 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.surface2 },
    stepRowDone: { opacity: 0.5 },
    stepCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    stepCheckDone: { backgroundColor: theme.accent },
    checkMark: { color: theme.text, fontSize: 12, fontWeight: '700' },
    stepText: { flex: 1, color: theme.text, fontSize: 15 },
    stepTextDone: { textDecorationLine: 'line-through', color: theme.textMuted },
    stepDuration: { color: theme.textMuted, fontSize: 12 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    deleteBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.surface2, alignItems: 'center' },
    deleteBtnText: { color: theme.danger, fontWeight: '600' },
    completeBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: theme.accent, alignItems: 'center' },
    completeBtnDisabled: { opacity: 0.4 },
    completeBtnText: { color: theme.text, fontWeight: '700' },
    label: { color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
    input: { backgroundColor: theme.bg, borderRadius: 12, padding: 14, color: theme.text, fontSize: 15, borderWidth: 1, borderColor: theme.surface2 },
    row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.surface2, borderWidth: 2, borderColor: 'transparent' },
    chipActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
    chipText: { color: theme.textMuted, fontSize: 13 },
    chipTextActive: { color: theme.text, fontWeight: '700' },
    dayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    dayBtnActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
    dayText: { color: theme.textMuted, fontSize: 13, fontWeight: '700' },
    dayTextActive: { color: theme.text },
    addStepRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    addStepBtn: { backgroundColor: theme.accent, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    addStepBtnText: { color: theme.text, fontSize: 22, fontWeight: '700' },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.surface2, alignItems: 'center' },
    cancelText: { color: theme.textMuted, fontWeight: '600' },
    saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.accent, alignItems: 'center' },
    saveBtnDisabled: { opacity: 0.4 },
    saveText: { color: theme.text, fontWeight: '700' },
  })
}

export default function RoutinesScreen() {
  const { theme } = useThemeStore()
  const styles = createStyles(theme)
  const modal = createModalStyles(theme)
  const { user } = useAuthStore()
  const { routines, setRoutines, isLoading } = useRoutinesStore()
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const uid = user?.uid ?? ''

  useEffect(() => {
    if (!uid) return
    return subscribeToRoutines(uid, setRoutines)
  }, [uid])

  async function handleStepToggle(routineId: string, stepId: string) {
    await completeRoutineStep(uid, routineId, stepId)
    // Actualizar local para feedback inmediato
    const updated = routines.map(r =>
      r.id === routineId
        ? { ...r, steps: r.steps.map(s => s.id === stepId ? { ...s, done: true } : s) }
        : r
    )
    setRoutines(updated)
    // Verificar si todos los pasos están completos
    const routine = updated.find(r => r.id === routineId)
    if (routine && routine.steps.every(s => s.done)) {
      await handleCompleteRoutine(routineId)
    }
  }

  async function handleCompleteRoutine(routineId: string) {
    await completeRoutine(uid, routineId)
    await awardXPForAction(uid, 'routine')
    await updateStreak(uid)
    setActiveRoutine(null)
  }

  async function handleDelete(routineId: string) {
    await deleteRoutine(uid, routineId)
    setActiveRoutine(null)
  }

  const morningRoutines = routines.filter(r => r.type === 'morning')
  const nightRoutines = routines.filter(r => r.type === 'night')
  const customRoutines = routines.filter(r => r.type === 'custom')

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Rutinas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>

          {routines.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔄</Text>
              <Text style={styles.emptyTitle}>Sin rutinas aún</Text>
              <Text style={styles.emptySub}>
                Las rutinas te ayudan a mantener constancia sin pensar demasiado.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
                <Text style={styles.emptyBtnText}>Crear primera rutina</Text>
              </TouchableOpacity>
            </View>
          )}

          {morningRoutines.length > 0 && (
            <Section title="🌅 Mañana" routines={morningRoutines} onPress={setActiveRoutine} styles={styles} />
          )}
          {nightRoutines.length > 0 && (
            <Section title="🌙 Noche" routines={nightRoutines} onPress={setActiveRoutine} styles={styles} />
          )}
          {customRoutines.length > 0 && (
            <Section title="⚡ Personalizadas" routines={customRoutines} onPress={setActiveRoutine} styles={styles} />
          )}

        </ScrollView>
      )}

      {/* Modal rutina activa */}
      {activeRoutine && (
        <Modal visible transparent animationType="slide">
          <View style={modal.overlay}>
            <View style={modal.sheet}>
              <View style={modal.sheetHeader}>
                <Text style={modal.sheetTitle}>{activeRoutine.title}</Text>
                <TouchableOpacity onPress={() => setActiveRoutine(null)}>
                  <Text style={modal.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={modal.streakText}>
                🔥 Racha: {activeRoutine.streak} días
              </Text>

              {/* Progress */}
              <View style={modal.progressRow}>
                <View style={modal.progressBar}>
                  <View style={[
                    modal.progressFill,
                    {
                      width: `${(activeRoutine.steps.filter(s => s.done).length /
                        Math.max(activeRoutine.steps.length, 1)) * 100}%`
                    }
                  ]} />
                </View>
                <Text style={modal.progressLabel}>
                  {activeRoutine.steps.filter(s => s.done).length}/{activeRoutine.steps.length}
                </Text>
              </View>

              <ScrollView style={modal.stepList}>
                {activeRoutine.steps.map(step => (
                  <TouchableOpacity
                    key={step.id}
                    style={[modal.stepRow, step.done && modal.stepRowDone]}
                    onPress={() => handleStepToggle(activeRoutine.id, step.id)}
                  >
                    <View style={[modal.stepCheck, step.done && modal.stepCheckDone]}>
                      {step.done && <Text style={modal.checkMark}>✓</Text>}
                    </View>
                    <Text style={[modal.stepText, step.done && modal.stepTextDone]}>
                      {step.title}
                    </Text>
                    {step.durationMin && (
                      <Text style={modal.stepDuration}>{step.durationMin}min</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={modal.actions}>
                <TouchableOpacity
                  style={modal.deleteBtn}
                  onPress={() => handleDelete(activeRoutine.id)}
                >
                  <Text style={modal.deleteBtnText}>🗑 Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modal.completeBtn,
                    !activeRoutine.steps.every(s => s.done) && modal.completeBtnDisabled,
                  ]}
                  onPress={() => handleCompleteRoutine(activeRoutine.id)}
                  disabled={!activeRoutine.steps.every(s => s.done)}
                >
                  <Text style={modal.completeBtnText}>✓ Completar rutina</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal crear rutina */}
      <AddRoutineModal
        visible={showAdd}
        uid={uid}
        onClose={() => setShowAdd(false)}
        modal={modal}
        theme={theme}
      />
    </View>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  title, routines, onPress, styles,
}: { title: string; routines: Routine[]; onPress: (r: Routine) => void; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {routines.map(r => {
        const completedSteps = r.steps.filter(s => s.done).length
        const totalSteps = r.steps.length
        const pct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
        return (
          <TouchableOpacity key={r.id} style={styles.routineCard} onPress={() => onPress(r)}>
            <View style={styles.routineTop}>
              <Text style={styles.routineTitle}>{r.title}</Text>
              <Text style={styles.routineStreak}>🔥 {r.streak}d</Text>
            </View>
            <Text style={styles.routineMeta}>
              {r.scheduledTime}  ·  {r.activeDays.map(d => DAY_LABELS[d]).join(' ')}
            </Text>
            <View style={styles.routineProgress}>
              <View style={styles.routineProgressBar}>
                <View style={[styles.routineProgressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.routineProgressLabel}>{completedSteps}/{totalSteps}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ─── Add Routine Modal ────────────────────────────────────────────────────────
function AddRoutineModal({
  visible, uid, onClose, modal, theme,
}: { visible: boolean; uid: string; onClose: () => void; modal: ReturnType<typeof createModalStyles>; theme: AppTheme }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<RoutineType>('morning')
  const [time, setTime] = useState('07:30')
  const [days, setDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [stepText, setStepText] = useState('')
  const [steps, setSteps] = useState<{ title: string }[]>([])
  const [saving, setSaving] = useState(false)

  function toggleDay(day: DayOfWeek) {
    setDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day])
  }

  function addStep() {
    if (!stepText.trim()) return
    setSteps(s => [...s, { title: stepText.trim() }])
    setStepText('')
  }

  async function handleSave() {
    if (!title.trim() || steps.length === 0) return
    setSaving(true)
    const input: CreateRoutineInput = {
      title: title.trim(),
      type,
      steps,
      scheduledTime: time,
      activeDays: days,
    }
    await createRoutine(uid, input)
    setTitle(''); setSteps([]); setStepText(''); setType('morning'); setDays(['mon','tue','wed','thu','fri'])
    setSaving(false)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modal.overlay}>
        <ScrollView>
          <View style={[modal.sheet, { paddingBottom: 40 }]}>
            <Text style={modal.sheetTitle}>Nueva rutina</Text>

            <TextInput
              style={modal.input}
              placeholder="Nombre de la rutina"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Tipo */}
            <Text style={modal.label}>Tipo</Text>
            <View style={modal.row}>
              {(['morning', 'night', 'custom'] as RoutineType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[modal.chip, type === t && modal.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[modal.chipText, type === t && modal.chipTextActive]}>
                    {t === 'morning' ? '🌅 Mañana' : t === 'night' ? '🌙 Noche' : '⚡ Custom'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hora */}
            <Text style={modal.label}>Hora</Text>
            <TextInput
              style={modal.input}
              value={time}
              onChangeText={setTime}
              placeholder="07:30"
              placeholderTextColor="#A7A9BE"
              keyboardType="numbers-and-punctuation"
            />

            {/* Días */}
            <Text style={modal.label}>Días activos</Text>
            <View style={modal.row}>
              {ALL_DAYS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[modal.dayBtn, days.includes(d) && modal.dayBtnActive]}
                  onPress={() => toggleDay(d)}
                >
                  <Text style={[modal.dayText, days.includes(d) && modal.dayTextActive]}>
                    {DAY_LABELS[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pasos */}
            <Text style={modal.label}>Pasos</Text>
            {steps.map((s, i) => (
              <View key={i} style={modal.stepRow}>
                <Text style={modal.stepCheck}>○</Text>
                <Text style={modal.stepText}>{s.title}</Text>
                <TouchableOpacity onPress={() => setSteps(st => st.filter((_, j) => j !== i))}>
                  <Text style={{ color: theme.danger, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={modal.addStepRow}>
              <TextInput
                style={[modal.input, { flex: 1 }]}
                placeholder="Agregar paso..."
                placeholderTextColor={theme.textMuted}
                value={stepText}
                onChangeText={setStepText}
                onSubmitEditing={addStep}
                returnKeyType="done"
              />
              <TouchableOpacity style={modal.addStepBtn} onPress={addStep}>
                <Text style={modal.addStepBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={modal.actions}>
              <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.saveBtn, (saving || !title.trim() || steps.length === 0) && modal.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving || !title.trim() || steps.length === 0}
              >
                <Text style={modal.saveText}>{saving ? 'Guardando...' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

