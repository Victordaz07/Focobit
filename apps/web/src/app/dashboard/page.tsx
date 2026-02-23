'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, getGamificationProfile, getUserTasks } from '@focobit/firebase-config'
import { GamificationProfile, Task } from '@focobit/shared'
import { calculateLevel, xpProgressPercent, getLevelTitle } from '@focobit/shared'

export default function DashboardPage() {
  const [gam, setGam] = useState<GamificationProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthChanged(async user => {
      if (!user) return
      const [g, t] = await Promise.all([
        getGamificationProfile(user.uid),
        getUserTasks(user.uid),
      ])
      if (g) setGam(g)
      setTasks(t)
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoader />

  const level = gam ? calculateLevel(gam.xp) : 1
  const xpPct = gam ? xpProgressPercent(gam.xp) : 0
  const title = getLevelTitle(level)
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Dashboard</h1>

      {/* Stats cards */}
      <div style={s.statsGrid}>
        <StatCard emoji="⚡" label="Nivel" value={`${level} — ${title}`} accent />
        <StatCard emoji="🔥" label="Racha" value={`${gam?.streakDays ?? 0} días`} />
        <StatCard emoji="✅" label="Completadas" value={`${completedTasks}`} />
        <StatCard emoji="⏳" label="Pendientes" value={`${pendingTasks}`} />
        <StatCard emoji="🪙" label="Monedas" value={`${gam?.coins ?? 0}`} />
        <StatCard emoji="⏱" label="Sesiones Focus" value={`${gam?.totalFocusSessions ?? 0}`} />
      </div>

      {/* XP Progress */}
      <div style={s.xpCard}>
        <div style={s.xpTop}>
          <span style={s.xpLabel}>{gam?.xp ?? 0} XP total</span>
          <span style={s.xpMuted}>Nivel {level + 1} en {300 - ((gam?.xp ?? 0) % 300)} XP</span>
        </div>
        <div style={s.xpBarBg}>
          <div style={{ ...s.xpBarFill, width: `${xpPct}%` }} />
        </div>
      </div>

      {/* Racha banner */}
      {gam && (
        <div style={{ ...s.streakBanner, borderLeftColor: gam.streakState === 'paused' ? 'var(--orange)' : 'var(--accent)' }}>
          <strong>
            {gam.streakState === 'active' && '🔥 Racha activa'}
            {gam.streakState === 'paused' && '⏸ Racha en pausa — vuelve antes de 48h'}
            {gam.streakState === 'recovered' && '💜 Racha recuperada'}
          </strong>
          <p style={s.streakSub}>{gam.streakDays} días consecutivos</p>
        </div>
      )}

      {/* Tareas pendientes */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Tareas pendientes</h2>
        {tasks.filter(t => t.status === 'pending').slice(0, 8).map(task => (
          <div key={task.id} style={s.taskRow}>
            <span style={s.taskDot}>
              {task.priority === 'urgent' ? '🔴' : task.priority === 'normal' ? '🟡' : '☁️'}
            </span>
            <span style={s.taskTitle}>{task.title}</span>
            <span style={s.taskEnergy}>
              {task.energyRequired === 'low' ? '🔋' : task.energyRequired === 'medium' ? '🔋🔋' : '🔋🔋🔋'}
            </span>
          </div>
        ))}
        {tasks.filter(t => t.status === 'pending').length === 0 && (
          <p style={s.empty}>✅ Sin tareas pendientes</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value, accent }: {
  emoji: string; label: string; value: string; accent?: boolean
}) {
  return (
    <div style={s.statCard}>
      <span style={s.statEmoji}>{emoji}</span>
      <span style={{ ...s.statValue, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

function PageLoader() {
  return (
    <div style={{ padding: 48, color: 'var(--text-muted)', textAlign: 'center' }}>
      Cargando...
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 900 },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: { background: 'var(--surface)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 18, fontWeight: 700 },
  statLabel: { fontSize: 12, color: 'var(--text-muted)' },
  xpCard: { background: 'var(--surface)', borderRadius: 14, padding: 20, marginBottom: 16 },
  xpTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  xpLabel: { fontWeight: 600 },
  xpMuted: { color: 'var(--text-muted)', fontSize: 13 },
  xpBarBg: { height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', background: 'var(--accent)', borderRadius: 5, transition: 'width 0.3s' },
  streakBanner: { background: 'var(--surface)', borderRadius: 14, padding: 16, marginBottom: 24, borderLeft: '4px solid var(--accent)' },
  streakSub: { color: 'var(--text-muted)', fontSize: 13, marginTop: 4 },
  section: { background: 'var(--surface)', borderRadius: 14, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)' },
  taskRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--surface2)' },
  taskDot: { fontSize: 14 },
  taskTitle: { flex: 1, fontSize: 14 },
  taskEnergy: { fontSize: 13 },
  empty: { color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' },
}
