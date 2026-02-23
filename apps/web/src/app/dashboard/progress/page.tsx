'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, getGamificationProfile, getFirestoreDb, doc, getDoc } from '@focobit/firebase-config'
import { GamificationProfile, Skills, SkillName } from '@focobit/shared'
import { calculateLevel, getLevelTitle, xpProgressPercent, xpToNextLevel, SKILL_PERKS } from '@focobit/shared'

const SKILL_META: Record<SkillName, { label: string; emoji: string; color: string }> = {
  focus:       { label: 'Enfoque',    emoji: '🎯', color: '#6C63FF' },
  order:       { label: 'Orden',      emoji: '📋', color: '#4ECDC4' },
  consistency: { label: 'Constancia', emoji: '🔥', color: '#FF9500' },
  energy:      { label: 'Energía',    emoji: '⚡', color: '#FFD60A' },
}

export default function ProgressPage() {
  const [gam, setGam] = useState<GamificationProfile | null>(null)
  const [skills, setSkills] = useState<Skills | null>(null)

  useEffect(() => {
    return onAuthChanged(async user => {
      if (!user) return
      const g = await getGamificationProfile(user.uid)
      if (g) setGam(g)
      const db = getFirestoreDb()
      const snap = await getDoc(doc(db, 'users', user.uid, 'skills', 'profile'))
      if (snap.exists()) setSkills(snap.data() as Skills)
    })
  }, [])

  const level = gam ? calculateLevel(gam.xp) : 1
  const xpPct = gam ? xpProgressPercent(gam.xp) : 0

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Progreso</h1>

      {/* Nivel y XP */}
      <div style={s.card}>
        <div style={s.levelRow}>
          <div>
            <div style={s.levelNum}>Nivel {level}</div>
            <div style={s.levelTitle}>{getLevelTitle(level)}</div>
          </div>
          <div style={s.xpInfo}>
            <span style={s.xpTotal}>{gam?.xp ?? 0} XP</span>
            <span style={s.xpToNext}>{xpToNextLevel(gam?.xp ?? 0)} XP para nivel {level + 1}</span>
          </div>
        </div>
        <div style={s.xpBarBg}>
          <div style={{ ...s.xpBarFill, width: `${xpPct}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Racha', value: `${gam?.streakDays ?? 0}d`, emoji: '🔥' },
          { label: 'Monedas', value: gam?.coins ?? 0, emoji: '🪙' },
          { label: 'Tareas', value: gam?.totalTasksCompleted ?? 0, emoji: '✅' },
          { label: 'Focus', value: gam?.totalFocusSessions ?? 0, emoji: '⏱' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <span style={{ fontSize: 24 }}>{stat.emoji}</span>
            <span style={s.statVal}>{stat.value}</span>
            <span style={s.statLbl}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Skill Tree */}
      <h2 style={s.sectionTitle}>Árbol de Habilidades</h2>
      {skills && (Object.keys(SKILL_META) as SkillName[]).map(skill => {
        const meta = SKILL_META[skill]
        const s_ = skills[skill]
        const perk = SKILL_PERKS[skill][s_.level]
        return (
          <div key={skill} style={s.skillCard}>
            <div style={s.skillTop}>
              <span style={{ fontSize: 22 }}>{meta.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={s.skillName}>{meta.label}</div>
                {perk && <div style={s.skillPerk}>✓ {perk.replace(/_/g, ' ')}</div>}
              </div>
              <div style={{ ...s.skillBadge, background: meta.color + '33', color: meta.color }}>
                Nv.{s_.level}
              </div>
            </div>
            <div style={s.skillBarBg}>
              <div style={{ ...s.skillBarFill, width: `${(s_.xp % 100)}%`, background: meta.color }} />
            </div>
            <div style={s.skillXP}>{s_.xp % 100}/100 XP</div>
          </div>
        )
      })}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 800 },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 24 },
  card: { background: 'var(--surface)', borderRadius: 14, padding: 20, marginBottom: 16 },
  levelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelNum: { fontSize: 28, fontWeight: 800, color: 'var(--accent)' },
  levelTitle: { color: 'var(--text-muted)', fontSize: 14, marginTop: 2 },
  xpInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  xpTotal: { fontWeight: 700 },
  xpToNext: { fontSize: 12, color: 'var(--text-muted)' },
  xpBarBg: { height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', background: 'var(--accent)', borderRadius: 5 },
  statsRow: { display: 'flex', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, background: 'var(--surface)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  statVal: { fontSize: 22, fontWeight: 800 },
  statLbl: { fontSize: 12, color: 'var(--text-muted)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, marginTop: 8 },
  skillCard: { background: 'var(--surface)', borderRadius: 14, padding: 16, marginBottom: 10 },
  skillTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  skillName: { fontWeight: 700, fontSize: 15 },
  skillPerk: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  skillBadge: { padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: 13 },
  skillBarBg: { height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  skillBarFill: { height: '100%', borderRadius: 3 },
  skillXP: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' },
}
