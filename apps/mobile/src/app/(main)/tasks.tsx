import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useTasksStore, useOfflineStore, useThemeStore } from '../../stores'
import {
  subscribeToTasks, createTask, completeTask,
  generateMicroStepsForTask, updateTaskMicroSteps, toggleMicroStep,
} from '@focobit/firebase-config'
import { Task, EnergyLevel, TaskPriority, CreateTaskInput, addPendingOp, getPendingOps, type AppTheme } from '@focobit/shared'
import { trackEvent } from '../../hooks/useAnalytics'
import { startTrace } from '../../hooks/usePerformance'

type FilterTab = 'all' | 'urgent' | 'someday'

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 56 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    heading: { fontSize: 24, fontWeight: '800', color: theme.text },
    addBtn: { backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    addBtnText: { color: theme.text, fontWeight: '700', fontSize: 14 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.surface },
    filterTabActive: { backgroundColor: theme.accent },
    filterText: { color: theme.textMuted, fontSize: 13 },
    filterTextActive: { color: theme.text, fontWeight: '700' },
    list: { padding: 20, paddingTop: 0, paddingBottom: 40 },
    taskCard: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: theme.surface, borderRadius: 12, padding: 14, marginBottom: 8,
    },
    taskDone: { opacity: 0.4 },
    taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    checkIcon: { color: theme.accent, fontSize: 13, fontWeight: '700' },
    taskInfo: { flex: 1 },
    taskTitle: { color: theme.text, fontSize: 15, fontWeight: '600' },
    done: { textDecorationLine: 'line-through', color: theme.textMuted },
    taskMeta: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
    priorityDot: { fontSize: 16 },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyEmoji: { fontSize: 40 },
    emptyText: { color: theme.textMuted, marginTop: 12, fontSize: 16 },
  })
}

function createModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    title: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 },
    meta: { color: theme.textMuted, fontSize: 14, marginBottom: 8 },
    label: { color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
    input: { backgroundColor: theme.bg, borderRadius: 12, padding: 14, color: theme.text, fontSize: 16, borderWidth: 1, borderColor: theme.surface2 },
    row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.surface2, borderWidth: 2, borderColor: 'transparent' },
    chipActive: { borderColor: theme.accent, backgroundColor: theme.accentDim },
    chipText: { color: theme.textMuted, fontSize: 13 },
    chipTextActive: { color: theme.text, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.surface2, alignItems: 'center' },
    cancelText: { color: theme.textMuted, fontWeight: '600' },
    saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.accent, alignItems: 'center' },
    saveBtnDisabled: { opacity: 0.4 },
    saveText: { color: theme.text, fontWeight: '700' },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    progressBar: { flex: 1, height: 6, backgroundColor: theme.bg, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 3 },
    progressLabel: { color: theme.textMuted, fontSize: 12, width: 32, textAlign: 'right' },
    aiPrompt: { backgroundColor: theme.bg, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 },
    aiPromptEmoji: { fontSize: 36 },
    aiPromptTitle: { color: theme.text, fontWeight: '700', fontSize: 16, textAlign: 'center' },
    aiPromptSub: { color: theme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
    aiBtn: { backgroundColor: theme.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
    aiBtnDisabled: { opacity: 0.5 },
    aiBtnText: { color: theme.text, fontWeight: '700', fontSize: 15 },
    regenerateBtn: { alignItems: 'center', paddingVertical: 8 },
    regenerateBtnText: { color: theme.textMuted, fontSize: 13 },
    errorText: { color: theme.danger, fontSize: 13, textAlign: 'center' },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
    stepCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    stepText: { color: theme.text, fontSize: 15, flex: 1 },
    stepDuration: { color: theme.textMuted, fontSize: 12 },
  })
}

export default function TasksScreen() {
  const { theme } = useThemeStore()
  const styles = createStyles(theme)
  const { user } = useAuthStore()
  const { tasks, setTasks } = useTasksStore()
  const { isOnline, setPendingCount } = useOfflineStore()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  const uid = user?.uid ?? ''

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToTasks(uid, (t) => {
      setTasks(t)
      setLoading(false)
    })
    return unsub
  }, [uid])

  const filtered = tasks.filter(t => {
    if (filter === 'urgent') return t.priority === 'urgent'
    if (filter === 'someday') return t.priority === 'someday'
    return true
  })

  async function handleComplete(task: Task) {
    const taskId = task.id
    // Optimistic update inmediato
    const { setTasks: setStoreTasks, tasks: storeTasks } = useTasksStore.getState()
    setStoreTasks(storeTasks.map(t => t.id === taskId ? { ...t, status: 'done' } as Task : t))

    if (!isOnline) {
      addPendingOp({ type: 'complete_task', payload: { taskId } })
      setPendingCount(getPendingOps().length)
      return
    }

    try {
      await completeTask(uid, taskId)
      await trackEvent('task_completed', {
        had_micro_steps: (task.microSteps?.length ?? 0) > 0,
        energy_required: task.energyRequired,
        priority: task.priority,
      })
    } catch {
      // Revertir si falla
      const { tasks: currentTasks, setTasks: setStoreTasks2 } = useTasksStore.getState()
      setStoreTasks2(currentTasks.map(t =>
        t.id === taskId ? { ...t, status: 'pending' } as Task : t
      ))
      addPendingOp({ type: 'complete_task', payload: { taskId } })
      setPendingCount(getPendingOps().length)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Tareas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {(['all', 'urgent', 'someday'] as FilterTab[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todas' : f === 'urgent' ? '🔴 Urgente' : '☁️ Algún día'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyText}>Sin tareas aquí</Text>
            </View>
          ) : (
            filtered.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, task.status === 'done' && styles.taskDone]}
                onPress={() => setShowDetail(task)}
                onLongPress={() => handleComplete(task)}
              >
                <View style={styles.taskLeft}>
                  <TouchableOpacity
                    style={styles.checkCircle}
                    onPress={() => handleComplete(task)}
                  >
                    <Text style={styles.checkIcon}>
                      {task.status === 'done' ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.status === 'done' && styles.done]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {energyLabel(task.energyRequired)}
                      {task.microSteps.length > 0 &&
                        `  ·  ${task.microSteps.filter(s => s.done).length}/${task.microSteps.length} pasos`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.priorityDot}>
                  {task.priority === 'urgent' ? '🔴' : task.priority === 'someday' ? '☁️' : '🟡'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal: Agregar tarea */}
      <AddTaskModal
        visible={showAdd}
        uid={uid}
        onClose={() => setShowAdd(false)}
        theme={theme}
      />

      {/* Modal: Detalle de tarea */}
      {showDetail && (
        <TaskDetailModal
          theme={theme}
          task={showDetail}
          uid={uid}
          onClose={() => setShowDetail(null)}
          onComplete={() => { handleComplete(showDetail); setShowDetail(null) }}
        />
      )}
    </View>
  )
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────

function AddTaskModal({
  visible, uid, onClose, theme,
}: { visible: boolean; uid: string; onClose: () => void; theme: AppTheme }) {
  const modal = createModalStyles(theme)
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const input: CreateTaskInput = { title: title.trim(), energyRequired: energy, priority }
    await createTask(uid, input)
    setTitle('')
    setEnergy('medium')
    setPriority('normal')
    setSaving(false)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>Nueva tarea</Text>

          <TextInput
            style={modal.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
          />

          <Text style={modal.label}>Energía requerida</Text>
          <View style={modal.row}>
            {(['low', 'medium', 'high'] as EnergyLevel[]).map(e => (
              <TouchableOpacity
                key={e}
                style={[modal.chip, energy === e && modal.chipActive]}
                onPress={() => setEnergy(e)}
              >
                <Text style={[modal.chipText, energy === e && modal.chipTextActive]}>
                  {e === 'low' ? '🔋 Baja' : e === 'medium' ? '🔋🔋 Media' : '🔋🔋🔋 Alta'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Prioridad</Text>
          <View style={modal.row}>
            {(['urgent', 'normal', 'someday'] as TaskPriority[]).map(p => (
              <TouchableOpacity
                key={p}
                style={[modal.chip, priority === p && modal.chipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[modal.chipText, priority === p && modal.chipTextActive]}>
                  {p === 'urgent' ? '🔴 Urgente' : p === 'normal' ? '🟡 Normal' : '☁️ Algún día'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={modal.actions}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modal.saveBtn, (!title.trim() || saving) && modal.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!title.trim() || saving}
            >
              <Text style={modal.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({
  task, uid, onClose, onComplete, theme,
}: { task: Task; uid: string; onClose: () => void; onComplete: () => void; theme: AppTheme }) {
  const modal = createModalStyles(theme)
  const [steps, setSteps] = useState(task.microSteps ?? [])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const { tasks: storeTasks, currentEnergy } = useTasksStore()

  // Sync con cambios externos (realtime)
  useEffect(() => {
    const updated = storeTasks.find(t => t.id === task.id)
    if (updated) setSteps(updated.microSteps ?? [])
  }, [storeTasks, task.id])

  async function handleGenerateSteps() {
    const trace = await startTrace('generate_micro_steps')
    setGenerating(true)
    setError('')
    try {
      const newSteps = await generateMicroStepsForTask(task.title, currentEnergy)
      await updateTaskMicroSteps(uid, task.id, newSteps)
      setSteps(newSteps)
      await trackEvent('micro_steps_generated', {
        energy_level: currentEnergy,
        step_count: newSteps.length,
      })
    } catch (e) {
      setError('No se pudieron generar los pasos. Intenta de nuevo.')
      console.error(e)
    } finally {
      await trace?.stop()
      setGenerating(false)
    }
  }

  async function handleToggleStep(stepId: string, done: boolean) {
    await toggleMicroStep(uid, task.id, stepId, done)
    setSteps(s => s.map(st => st.id === stepId ? { ...st, done } : st))
  }

  const completedCount = steps.filter(s => s.done).length
  const allDone = steps.length > 0 && completedCount === steps.length

  return (
    <Modal visible transparent animationType="slide">
      <View style={modal.overlay}>
        <View style={modal.sheet}>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={modal.title}>{task.title}</Text>
              <Text style={modal.meta}>
                {energyLabel(task.energyRequired)}  ·  {priorityLabel(task.priority)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ color: theme.textMuted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progreso micro pasos */}
          {steps.length > 0 && (
            <View style={modal.progressRow}>
              <View style={modal.progressBar}>
                <View style={[modal.progressFill, { width: `${(completedCount / steps.length) * 100}%` }]} />
              </View>
              <Text style={modal.progressLabel}>{completedCount}/{steps.length}</Text>
            </View>
          )}

          {/* Micro pasos */}
          {steps.length > 0 ? (
            <ScrollView style={{ maxHeight: 260 }}>
              {steps.map(step => (
                <TouchableOpacity
                  key={step.id}
                  style={[modal.stepRow, step.done && { opacity: 0.5 }]}
                  onPress={() => handleToggleStep(step.id, !step.done)}
                >
                  <View style={[modal.stepCheck, step.done && { backgroundColor: theme.accent }]}>
                    {step.done && <Text style={{ color: theme.text, fontSize: 11, fontWeight: '700' }}>✓</Text>}
                  </View>
                  <Text style={[modal.stepText, step.done && { textDecorationLine: 'line-through', color: theme.textMuted }]}>
                    {step.title}
                  </Text>
                  {step.durationMin != null && (
                    <Text style={modal.stepDuration}>{step.durationMin}min</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            /* Estado vacío — botón de IA */
            <View style={modal.aiPrompt}>
              <Text style={modal.aiPromptEmoji}>🤔</Text>
              <Text style={modal.aiPromptTitle}>¿No sabes por dónde empezar?</Text>
              <Text style={modal.aiPromptSub}>
                La IA divide esta tarea en pasos pequeños según tu energía actual.
              </Text>
              {error ? <Text style={modal.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={[modal.aiBtn, generating && modal.aiBtnDisabled]}
                onPress={handleGenerateSteps}
                disabled={generating}
              >
                {generating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color={theme.text} size="small" />
                    <Text style={modal.aiBtnText}>Pensando...</Text>
                  </View>
                ) : (
                  <Text style={modal.aiBtnText}>✨ Generar micro pasos</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Regenerar si ya tiene pasos */}
          {steps.length > 0 && (
            <TouchableOpacity
              style={modal.regenerateBtn}
              onPress={handleGenerateSteps}
              disabled={generating}
            >
              <Text style={modal.regenerateBtnText}>
                {generating ? '⏳ Regenerando...' : '✨ Regenerar pasos'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Acciones */}
          <View style={modal.actions}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.saveBtn} onPress={onComplete}>
              <Text style={modal.saveText}>
                {allDone ? '🎉 Completar tarea' : '✓ Marcar completa'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function energyLabel(e: EnergyLevel) {
  return e === 'low' ? '🔋 Baja' : e === 'medium' ? '🔋🔋 Media' : '🔋🔋🔋 Alta'
}
function priorityLabel(p: TaskPriority) {
  return p === 'urgent' ? '🔴 Urgente' : p === 'normal' ? '🟡 Normal' : '☁️ Algún día'
}
