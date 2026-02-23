'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, subscribeToTasks, createTask, completeTask } from '@focobit/firebase-config'
import { Task, EnergyLevel, TaskPriority, CreateTaskInput } from '@focobit/shared'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [uid, setUid] = useState('')
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let taskUnsub: (() => void) | undefined
    const authUnsub = onAuthChanged(user => {
      if (taskUnsub) taskUnsub()
      if (!user) return
      setUid(user.uid)
      taskUnsub = subscribeToTasks(user.uid, setTasks)
    })
    return () => {
      authUnsub()
      if (taskUnsub) taskUnsub()
    }
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !uid) return
    setSaving(true)
    const input: CreateTaskInput = { title: title.trim(), energyRequired: energy, priority }
    await createTask(uid, input)
    setTitle('')
    setSaving(false)
  }

  async function handleComplete(taskId: string) {
    await completeTask(uid, taskId)
  }

  const pending = tasks.filter(t => t.status === 'pending')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Tareas</h1>

      {/* Formulario */}
      <form onSubmit={handleAdd} style={s.form}>
        <input
          style={s.input}
          placeholder="Nueva tarea..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select
          style={s.select}
          value={energy}
          onChange={e => setEnergy(e.target.value as EnergyLevel)}
        >
          <option value="low">🔋 Baja energía</option>
          <option value="medium">🔋🔋 Media</option>
          <option value="high">🔋🔋🔋 Alta</option>
        </select>
        <select
          style={s.select}
          value={priority}
          onChange={e => setPriority(e.target.value as TaskPriority)}
        >
          <option value="urgent">🔴 Urgente</option>
          <option value="normal">🟡 Normal</option>
          <option value="someday">☁️ Algún día</option>
        </select>
        <button style={s.addBtn} type="submit" disabled={saving || !title.trim()}>
          {saving ? '...' : '+ Agregar'}
        </button>
      </form>

      {/* Lista pendientes */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Pendientes ({pending.length})</h2>
        {pending.map(task => (
          <div key={task.id} style={s.taskRow}>
            <button style={s.checkBtn} onClick={() => handleComplete(task.id)} type="button">○</button>
            <div style={s.taskInfo}>
              <span style={s.taskTitle}>{task.title}</span>
              <span style={s.taskMeta}>
                {task.priority === 'urgent' ? '🔴' : task.priority === 'normal' ? '🟡' : '☁️'}
                {' · '}
                {task.energyRequired === 'low' ? '🔋' : task.energyRequired === 'medium' ? '🔋🔋' : '🔋🔋🔋'}
                {task.microSteps.length > 0 && ` · ${task.microSteps.length} pasos`}
              </span>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p style={s.empty}>✅ Sin tareas pendientes</p>}
      </div>

      {/* Completadas */}
      {done.length > 0 && (
        <div style={{ ...s.section, marginTop: 16 }}>
          <h2 style={s.sectionTitle}>Completadas ({done.length})</h2>
          {done.slice(0, 10).map(task => (
            <div key={task.id} style={{ ...s.taskRow, opacity: 0.5 }}>
              <span style={{ ...s.checkBtn, color: 'var(--accent)' }}>✓</span>
              <span style={{ ...s.taskTitle, textDecoration: 'line-through' }}>{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 800 },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 24 },
  form: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 200, background: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  select: { background: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  addBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14 },
  section: { background: 'var(--surface)', borderRadius: 14, padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16 },
  taskRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--surface2)' },
  checkBtn: { width: 28, height: 28, borderRadius: 14, border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 14, flexShrink: 0, background: 'none' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, display: 'block' },
  taskMeta: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  empty: { color: 'var(--text-muted)', fontSize: 14 },
}
