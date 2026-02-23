import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useGamificationStore, useTasksStore } from '../../stores'
import { getGamificationProfile, getFirestoreDb, doc, getDoc } from '@focobit/firebase-config'
import { Skills, SkillName } from '@focobit/shared'
import { SKILL_PERKS, getLevelTitle, xpToNextLevel } from '@focobit/shared'

const SKILL_LABELS: Record<SkillName, { label: string; emoji: string; color: string }> = {
  focus:       { label: 'Enfoque',     emoji: '🎯', color: '#6C63FF' },
  order:       { label: 'Orden',       emoji: '📋', color: '#4ECDC4' },
  consistency: { label: 'Constancia',  emoji: '🔥', color: '#FF9500' },
  energy:      { label: 'Energía',     emoji: '⚡', color: '#FFD60A' },
}

export default function ProgressScreen() {
  const { user } = useAuthStore()
  const { profile: gamProfile, setProfile, level, xpPercent } = useGamificationStore()
  const { tasks } = useTasksStore()
  const [skills, setSkills] = useState<Skills | null>(null)
  const [loading, setLoading] = useState(true)
  const uid = user?.uid ?? ''

  useEffect(() => {
    if (!uid) return
    async function load() {
      const gam = await getGamificationProfile(uid)
      if (gam) setProfile(gam)
      const db = getFirestoreDb()
      const skillsSnap = await getDoc(doc(db, 'users', uid, 'skills', 'profile'))
      if (skillsSnap.exists()) setSkills(skillsSnap.data() as Skills)
      setLoading(false)
    }
    load()
  }, [uid])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#6C63FF" size="large" />
      </View>
    )
  }

  const levelTitle = getLevelTitle(level)
  const xpToNext = gamProfile ? xpToNextLevel(gamProfile.xp) : 300
  const streakColor = gamProfile?.streakState === 'paused' ? '#FF9500' : '#6C63FF'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header perfil */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuario'}
          </Text>
          <Text style={styles.profileTitle}>{levelTitle}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNum}>{level}</Text>
          <Text style={styles.levelLbl}>nivel</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>{gamProfile?.xp ?? 0} XP total</Text>
          <Text style={styles.xpToNext}>{xpToNext} XP para nivel {level + 1}</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      {/* Stats rápidos */}
      <View style={styles.statsRow}>
        <StatCard
          emoji="✅"
          value={gamProfile?.totalTasksCompleted ?? 0}
          label="Tareas"
        />
        <StatCard
          emoji="⏱"
          value={gamProfile?.totalFocusSessions ?? 0}
          label="Focus"
        />
        <StatCard
          emoji="🔥"
          value={gamProfile?.streakDays ?? 0}
          label="Racha"
          color={streakColor}
        />
        <StatCard
          emoji="🪙"
          value={gamProfile?.coins ?? 0}
          label="Monedas"
        />
      </View>

      {/* Racha estado */}
      {gamProfile && (
        <View style={[styles.streakBanner, { borderLeftColor: streakColor }]}>
          <Text style={styles.streakBannerTitle}>
            {gamProfile.streakState === 'active' && '🔥 Racha activa'}
            {gamProfile.streakState === 'paused' && '⏸ Racha en pausa'}
            {gamProfile.streakState === 'recovered' && '💜 Racha recuperada'}
          </Text>
          <Text style={styles.streakBannerSub}>
            {gamProfile.streakState === 'paused'
              ? 'Vuelve antes de 48h para recuperar tu racha y ganar bonus.'
              : gamProfile.streakState === 'recovered'
              ? '¡Volviste! La racha sigue viva.'
              : `${gamProfile.streakDays} días consecutivos. ¡Sigue así!`}
          </Text>
        </View>
      )}

      {/* Skill Tree */}
      <Text style={styles.sectionTitle}>ÁRBOL DE HABILIDADES</Text>
      {skills && (Object.keys(SKILL_LABELS) as SkillName[]).map(skill => {
        const s = skills[skill]
        const meta = SKILL_LABELS[skill]
        const perkUnlocked = SKILL_PERKS[skill][s.level]
        const xpInLevel = s.xp % 100
        return (
          <View key={skill} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillEmoji}>{meta.emoji}</Text>
              <View style={styles.skillInfo}>
                <Text style={styles.skillLabel}>{meta.label}</Text>
                <Text style={styles.skillPerk}>
                  {perkUnlocked ? `✓ ${formatPerk(perkUnlocked)}` : ''}
                </Text>
              </View>
              <View style={[styles.skillLevelBadge, { backgroundColor: meta.color + '33' }]}>
                <Text style={[styles.skillLevelText, { color: meta.color }]}>
                  Nv.{s.level}
                </Text>
              </View>
            </View>
            <View style={styles.skillBar}>
              <View style={[
                styles.skillFill,
                { width: `${(xpInLevel / 100) * 100}%`, backgroundColor: meta.color }
              ]} />
            </View>
            <Text style={styles.skillXP}>{xpInLevel}/100 XP</Text>
          </View>
        )
      })}

      {/* Logros placeholder */}
      <Text style={styles.sectionTitle}>LOGROS</Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS_PREVIEW.map((a, i) => {
          const unlocked = checkAchievement(a.id, gamProfile, tasks.length)
          return (
            <View key={i} style={[styles.achievementCard, !unlocked && styles.achievementLocked]}>
              <Text style={styles.achievementEmoji}>{unlocked ? a.emoji : '🔒'}</Text>
              <Text style={styles.achievementTitle}>{a.title}</Text>
            </View>
          )
        })}
      </View>

    </ScrollView>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({ emoji, value, label, color = '#FFFFFF' }: {
  emoji: string; value: number; label: string; color?: string
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPerk(perk: string): string {
  return perk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const ACHIEVEMENTS_PREVIEW = [
  { id: 'first_task', emoji: '✅', title: 'Primera tarea' },
  { id: 'first_focus', emoji: '⏱', title: 'Primer focus' },
  { id: 'streak_3', emoji: '🔥', title: 'Racha de 3 días' },
  { id: 'level_3', emoji: '⚡', title: 'Nivel 3' },
  { id: 'tasks_10', emoji: '💪', title: '10 tareas' },
  { id: 'focus_5', emoji: '🧠', title: '5 sesiones focus' },
]

function checkAchievement(
  id: string,
  gam: { totalTasksCompleted?: number; totalFocusSessions?: number; streakDays?: number; level?: number } | null,
  taskCount: number
): boolean {
  if (!gam) return false
  switch (id) {
    case 'first_task':  return (gam.totalTasksCompleted ?? 0) >= 1
    case 'first_focus': return (gam.totalFocusSessions ?? 0) >= 1
    case 'streak_3':    return (gam.streakDays ?? 0) >= 3
    case 'level_3':     return (gam.level ?? 1) >= 3
    case 'tasks_10':    return (gam.totalTasksCompleted ?? 0) >= 10
    case 'focus_5':     return (gam.totalFocusSessions ?? 0) >= 5
    default: return false
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E17' },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: '#0F0E17', alignItems: 'center', justifyContent: 'center' },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  profileTitle: { color: '#A7A9BE', fontSize: 13, marginTop: 2 },
  levelBadge: { alignItems: 'center', backgroundColor: '#1E1B3A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: '#6C63FF' },
  levelNum: { color: '#6C63FF', fontSize: 22, fontWeight: '800' },
  levelLbl: { color: '#A7A9BE', fontSize: 11 },

  xpCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  xpToNext: { color: '#A7A9BE', fontSize: 13 },
  xpBar: { height: 10, backgroundColor: '#2A2A40', borderRadius: 5, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 5 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 12, alignItems: 'center' },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { color: '#A7A9BE', fontSize: 11, marginTop: 2 },

  streakBanner: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 20, borderLeftWidth: 4 },
  streakBannerTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  streakBannerSub: { color: '#A7A9BE', fontSize: 13, lineHeight: 20 },

  sectionTitle: { color: '#A7A9BE', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },

  skillCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 8 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  skillEmoji: { fontSize: 24 },
  skillInfo: { flex: 1 },
  skillLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  skillPerk: { color: '#A7A9BE', fontSize: 12, marginTop: 2 },
  skillLevelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  skillLevelText: { fontWeight: '800', fontSize: 13 },
  skillBar: { height: 6, backgroundColor: '#2A2A40', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  skillFill: { height: '100%', borderRadius: 3 },
  skillXP: { color: '#A7A9BE', fontSize: 11, textAlign: 'right' },

  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  achievementCard: { width: '30%', backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  achievementLocked: { opacity: 0.4 },
  achievementEmoji: { fontSize: 28 },
  achievementTitle: { color: '#FFFFFF', fontSize: 11, textAlign: 'center', fontWeight: '600' },
})
