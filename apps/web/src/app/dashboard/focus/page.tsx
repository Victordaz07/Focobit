'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, getFirestoreDb, collection, query, orderBy, limit, getDocs } from '@focobit/firebase-config'

interface FocusSession {
  id: string
  durationMin: number
  startedAt: unknown
  completedAt: unknown
  completed: boolean
  linkedTaskId: string | null
}

export default function FocusPage() {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMin, setTotalMin] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    return onAuthChanged(async user => {
      if (!user) return
      const db = getFirestoreDb()
      const q = query(
        collection(db, 'users', user.uid, 'focusSessions'),
        orderBy('startedAt', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as FocusSession))
      setSessions(data)
      const completed = data.filter(s => s.completed)
      setCompletedCount(completed.length)
      setTotalMin(completed.reduce((acc, s) => acc + (s.durationMin ?? 0), 0))
      setLoading(false)
    })
  }, [])

  function formatDate(ts: unknown): string {
    if (!ts) return '—'
    const date = (ts as { toDate?: () => Date }).toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string | number)
    return date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  const totalHours = Math.floor(totalMin / 60)
  const remainingMin = totalMin % 60

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Historial Focus</h1>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={{ fontSize: 24 }}>⏱</span>
          <span style={s.statVal}>{completedCount}</span>
          <span style={s.statLbl}>Sesiones completadas</span>
        </div>
        <div style={s.statCard}>
          <span style={{ fontSize: 24 }}>🕐</span>
          <span style={s.statVal}>{totalHours}h {remainingMin}m</span>
          <span style={s.statLbl}>Tiempo total en foco</span>
        </div>
        <div style={s.statCard}>
          <span style={{ fontSize: 24 }}>📊</span>
          <span style={s.statVal}>
            {completedCount > 0 ? Math.round(totalMin / completedCount) : 0}m
          </span>
          <span style={s.statLbl}>Promedio por sesión</span>
        </div>
      </div>

      {/* Distribución por duración */}
      {sessions.length > 0 && (
        <div style={s.card}>
          <h2 style={s.sectionTitle}>DISTRIBUCIÓN POR DURACIÓN</h2>
          <div style={s.distRow}>
            {[5, 10, 15, 20, 25].map(dur => {
              const count = sessions.filter(s => s.durationMin === dur && s.completed).length
              const maxCount = Math.max(...[5, 10, 15, 20, 25].map(d =>
                sessions.filter(s => s.durationMin === d && s.completed).length
              ), 1)
              return (
                <div key={dur} style={s.distItem}>
                  <div style={s.distBarWrap}>
                    <div style={{
                      ...s.distBar,
                      height: `${Math.max(4, (count / maxCount) * 80)}px`
                    }} />
                  </div>
                  <span style={s.distLabel}>{dur}m</span>
                  <span style={s.distCount}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista de sesiones */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>SESIONES RECIENTES</h2>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: 20 }}>Cargando...</div>
        ) : sessions.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏱</div>
            <div>Sin sesiones de focus aún.</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Usa la app móvil para iniciar tu primera sesión.
            </div>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} style={s.sessionRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  ...s.sessionBadge,
                  background: session.completed ? 'var(--accent-dim)' : 'var(--surface2)',
                  color: session.completed ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {session.completed ? '✓' : '✕'}
                </span>
                <div>
                  <div style={s.sessionDur}>{session.durationMin} minutos</div>
                  <div style={s.sessionDate}>{formatDate(session.startedAt)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {session.completed && (
                  <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                    +15 XP
                  </span>
                )}
                <span style={{
                  fontSize: 12,
                  color: session.completed ? 'var(--green)' : 'var(--danger)',
                }}>
                  {session.completed ? 'Completada' : 'Abandonada'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 860 },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 24 },
  statsRow: { display: 'flex', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, background: 'var(--surface)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 },
  statVal: { fontSize: 22, fontWeight: 800 },
  statLbl: { fontSize: 12, color: 'var(--text-muted)' },
  card: { background: 'var(--surface)', borderRadius: 14, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 },
  distRow: { display: 'flex', gap: 16, alignItems: 'flex-end', height: 110 },
  distItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  distBarWrap: { flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' },
  distBar: { width: '60%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', minHeight: 4 },
  distLabel: { fontSize: 12, color: 'var(--text-muted)' },
  distCount: { fontSize: 13, fontWeight: 700 },
  sessionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--surface2)' },
  sessionBadge: { width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  sessionDur: { fontSize: 15, fontWeight: 600 },
  sessionDate: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  empty: { textAlign: 'center', padding: '24px 0', color: 'var(--text)' },
}
