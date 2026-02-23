'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, subscribeToRoutines, createRoutine, completeRoutine, deleteRoutine } from '@focobit/firebase-config'
import type { Routine, RoutineType, DayOfWeek, CreateRoutineInput } from '@focobit/shared'

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue',
  fri: 'Vie', sat: 'Sáb', sun: 'Dom',
}
const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [uid, setUid] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<RoutineType>('morning')
  const [time, setTime] = useState('07:30')
  const [days, setDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [stepText, setStepText] = useState('')
  const [steps, setSteps] = useState<{ title: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return onAuthChanged(user => {
      if (!user) return
      setUid(user.uid)
      return subscribeToRoutines(user.uid, setRoutines)
    })
  }, [])

  function toggleDay(d: DayOfWeek) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || steps.length === 0) return
    setSaving(true)
    const input: CreateRoutineInput = { title: title.trim(), type, steps, scheduledTime: time, activeDays: days }
    await createRoutine(uid, input)
    setTitle(''); setSteps([]); setStepText(''); setShowForm(false)
    setSaving(false)
  }

  async function handleComplete(routineId: string) {
    await completeRoutine(uid, routineId)
  }

  async function handleDelete(routineId: string) {
    if (!confirm('¿Eliminar esta rutina?')) return
    await deleteRoutine(uid, routineId)
  }

  const byType = (t: RoutineType) => routines.filter(r => r.type === t)

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <h1 style={s.heading}>Rutinas</h1>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Nueva rutina'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSave} style={s.form}>
          <div style={s.formRow}>
            <input style={s.input} placeholder="Nombre de la rutina" value={title} onChange={e => setTitle(e.target.value)} required />
            <select style={s.select} value={type} onChange={e => setType(e.target.value as RoutineType)}>
              <option value="morning">🌅 Mañana</option>
              <option value="night">🌙 Noche</option>
              <option value="custom">⚡ Custom</option>
            </select>
            <input style={{ ...s.input, width: 90 }} value={time} onChange={e => setTime(e.target.value)} placeholder="07:30" />
          </div>

          <div style={s.daysRow}>
            {ALL_DAYS.map(d => (
              <button key={d} type="button"
                style={{ ...s.dayBtn, ...(days.includes(d) ? s.dayBtnActive : {}) }}
                onClick={() => toggleDay(d)}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>

          <div style={s.stepsSection}>
            <div style={s.formRow}>
              <input style={s.input} placeholder="Agregar paso..."
                value={stepText}
                onChange={e => setStepText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (stepText.trim()) { setSteps(p => [...p, { title: stepText.trim() }]); setStepText('') } } }}
              />
              <button type="button" style={s.addBtn}
                onClick={() => { if (stepText.trim()) { setSteps(p => [...p, { title: stepText.trim() }]); setStepText('') } }}
              >+ Paso</button>
            </div>
            {steps.map((step, i) => (
              <div key={i} style={s.stepRow}>
                <span style={s.stepDot}>○</span>
                <span style={{ flex: 1, fontSize: 14 }}>{step.title}</span>
                <button type="button" style={s.deleteSmall} onClick={() => setSteps(p => p.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>

          <button type="submit" style={{ ...s.addBtn, ...(saving || !title.trim() || steps.length === 0 ? s.btnDisabled : {}) }}
            disabled={saving || !title.trim() || steps.length === 0}>
            {saving ? 'Guardando...' : 'Crear rutina'}
          </button>
        </form>
      )}

      {/* Lista por tipo */}
      {(['morning', 'night', 'custom'] as RoutineType[]).map(t => {
        const list = byType(t)
        if (list.length === 0) return null
        return (
          <div key={t} style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>
              {t === 'morning' ? '🌅 Mañana' : t === 'night' ? '🌙 Noche' : '⚡ Custom'}
            </h2>
            {list.map(r => {
              const done = r.steps.filter(st => st.done).length
              const pct = r.steps.length > 0 ? (done / r.steps.length) * 100 : 0
              return (
                <div key={r.id} style={s.routineCard}>
                  <div style={s.routineTop}>
                    <div>
                      <div style={s.routineTitle}>{r.title}</div>
                      <div style={s.routineMeta}>
                        {r.scheduledTime} · {r.activeDays.map(d => DAY_LABELS[d]).join(', ')} · 🔥 {r.streak ?? 0} días
                      </div>
                    </div>
                    <div style={s.routineActions}>
                      <button style={s.completeBtn} onClick={() => handleComplete(r.id)}>✓ Completar</button>
                      <button style={s.deleteSmall} onClick={() => handleDelete(r.id)}>🗑</button>
                    </div>
                  </div>
                  <div style={s.progressWrap}>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${pct}%` }} />
                    </div>
                    <span style={s.progressLabel}>{done}/{r.steps.length}</span>
                  </div>
                  <div style={s.stepsListWeb}>
                    {r.steps.map(step => (
                      <div key={step.id} style={{ ...s.stepRow, opacity: step.done ? 0.4 : 1 }}>
                        <span style={{ color: step.done ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {step.done ? '✓' : '○'}
                        </span>
                        <span style={{ fontSize: 13, textDecoration: step.done ? 'line-through' : 'none' }}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {routines.length === 0 && !showForm && (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sin rutinas</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Crea tu primera rutina para mantener constancia.</div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 860 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  heading: { fontSize: 28, fontWeight: 800 },
  addBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  btnDisabled: { opacity: 0.4, cursor: 'default' },
  form: { background: 'var(--surface)', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 160, background: 'var(--bg)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  select: { background: 'var(--bg)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  daysRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  dayBtn: { padding: '6px 12px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, border: '2px solid transparent', cursor: 'pointer' },
  dayBtnActive: { borderColor: 'var(--accent)', color: '#fff', background: 'var(--accent-dim)' },
  stepsSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  stepRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--surface2)' },
  stepDot: { color: 'var(--accent)', fontSize: 14 },
  deleteSmall: { color: 'var(--danger)', background: 'none', fontSize: 14, padding: '4px 8px', cursor: 'pointer', borderRadius: 6 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 },
  routineCard: { background: 'var(--surface)', borderRadius: 14, padding: 18, marginBottom: 10 },
  routineTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  routineTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  routineMeta: { fontSize: 12, color: 'var(--text-muted)' },
  routineActions: { display: 'flex', gap: 8, alignItems: 'center' },
  completeBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  progressBg: { flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: 'var(--text-muted)', width: 32, textAlign: 'right' },
  stepsListWeb: { display: 'flex', flexDirection: 'column', gap: 4 },
  empty: { textAlign: 'center', padding: '60px 0', color: 'var(--text)' },
}
