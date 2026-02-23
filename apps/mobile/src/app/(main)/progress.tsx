import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useAuthStore, useGamificationStore, useTasksStore, useChallengesStore, useThemeStore } from '../../stores'
import { useChallenges } from '../../hooks'
import { getGamificationProfile, getFirestoreDb, doc, getDoc, getUnlockedAchievements, ACHIEVEMENTS_CATALOG } from '@focobit/firebase-config'
import { Skills, SkillName, type AppTheme } from '@focobit/shared'
import { SKILL_PERKS, getLevelTitle, xpToNextLevel } from '@focobit/shared'

const SKILL_LABELS: Record<SkillName, { label: string; emoji: string; color: string }> = {
  focus:       { label: 'Enfoque',     emoji: '🎯', color: '#6C63FF' },
  order:       { label: 'Orden',       emoji: '📋', color: '#4ECDC4' },
  consistency: { label: 'Constancia',  emoji: '🔥', color: '#FF9500' },
  energy:      { label: 'Energía',     emoji: '⚡', color: '#FFD60A' },
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { padding: 20, paddingTop: 56, paddingBottom: 48 },
    centered: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
    avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: theme.text, fontSize: 22, fontWeight: '800' },
    profileInfo: { flex: 1 },
    profileName: { color: theme.text, fontSize: 17, fontWeight: '700' },
    profileTitle: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
    levelBadge: { alignItems: 'center', backgroundColor: theme.accentDim, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: theme.accent },
    levelNum: { color: theme.accent, fontSize: 22, fontWeight: '800' },
    levelLbl: { color: theme.textMuted, fontSize: 11 },
    xpCard: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
    xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    xpLabel: { color: theme.text, fontWeight: '600', fontSize: 14 },
    xpToNext: { color: theme.textMuted, fontSize: 13 },
    xpBar: { height: 10, backgroundColor: theme.surface2, borderRadius: 5, overflow: 'hidden' },
    xpFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 5 },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statCard: { flex: 1, backgroundColor: theme.surface, borderRadius: 14, padding: 12, alignItems: 'center' },
    statEmoji: { fontSize: 20, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: theme.text },
    statLabel: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
    streakBanner: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, marginBottom: 20, borderLeftWidth: 4 },
    streakBannerTitle: { color: theme.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
    streakBannerSub: { color: theme.textMuted, fontSize: 13, lineHeight: 20 },
    sectionTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    skillCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, marginBottom: 8 },
    skillHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    skillEmoji: { fontSize: 24 },
    skillInfo: { flex: 1 },
    skillLabel: { color: theme.text, fontWeight: '700', fontSize: 15 },
    skillPerk: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
    skillLevelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    skillLevelText: { fontWeight: '800', fontSize: 13 },
    skillBar: { height: 6, backgroundColor: theme.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
    skillFill: { height: '100%', borderRadius: 3 },
    skillXP: { color: theme.textMuted, fontSize: 11, textAlign: 'right' },
    achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    challengeCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, marginBottom: 10 },
    challengeComplete: { borderWidth: 1, borderColor: theme.accent },
    challengeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    challengeTitle: { color: theme.text, fontWeight: '600', fontSize: 14, flex: 1 },
    challengeDone: { color: theme.accent, fontSize: 18, fontWeight: '800', marginLeft: 8 },
    challengeBar: { height: 6, backgroundColor: theme.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    challengeFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 3 },
    challengeBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    challengeProgress: { color: theme.textMuted, fontSize: 12 },
    challengeReward: { color: theme.accent, fontSize: 12, fontWeight: '600' },
    emptyCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 20, alignItems: 'center' },
    emptyCardText: { color: theme.textMuted, fontSize: 14 },
    achievementDesc: { color: theme.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
    achievementCard: { width: '30%', backgroundColor: theme.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
    achievementLocked: { opacity: 0.4 },
    achievementEmoji: { fontSize: 28 },
    achievementTitle: { color: theme.text, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  })
}

export default function ProgressScreen() {
  const { theme } = useThemeStore()
  const styles = createStyles(theme)
  const { user } = useAuthStore()
  const { profile: gamProfile, setProfile, level, xpPercent } = useGamificationStore()
  const { tasks } = useTasksStore()
  const [skills, setSkills] = useState<Skills | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { weeklyChallenge } = useChallengesStore()
  const uid = user?.uid ?? ''

  useChallenges()

  useEffect(() => {
    if (!uid) return
    async function load() {
      const gam = await getGamificationProfile(uid)
      if (gam) setProfile(gam)
      const db = getFirestoreDb()
      const skillsSnap = await getDoc(doc(db, 'users', uid, 'skills', 'profile'))
      if (skillsSnap.exists()) setSkills(skillsSnap.data() as Skills)
      const achievements = await getUnlockedAchievements(uid)
      setUnlockedAchievements(achievements.map(a => a.id))
      setLoading(false)
    }
    load()
  }, [uid])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    )
  }

  const levelTitle = getLevelTitle(level)
  const xpToNext = gamProfile ? xpToNextLevel(gamProfile.xp) : 300
  const streakColor = gamProfile?.streakState === 'paused' ? '#FF9500' : theme.accent

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
          styles={styles}
        />
        <StatCard
          emoji="⏱"
          value={gamProfile?.totalFocusSessions ?? 0}
          label="Focus"
          styles={styles}
        />
        <StatCard
          emoji="🔥"
          value={gamProfile?.streakDays ?? 0}
          label="Racha"
          color={streakColor}
          styles={styles}
        />
        <StatCard
          emoji="🪙"
          value={gamProfile?.coins ?? 0}
          label="Monedas"
          styles={styles}
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

      {/* Retos semanales */}
      <Text style={styles.sectionTitle}>RETOS DE LA SEMANA</Text>
      {weeklyChallenge ? (
        weeklyChallenge.challenges.map((challenge, i) => (
          <View key={i} style={[styles.challengeCard, challenge.completed && styles.challengeComplete]}>
            <View style={styles.challengeTop}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              {challenge.completed && <Text style={styles.challengeDone}>✓</Text>}
            </View>
            <View style={styles.challengeBar}>
              <View style={[
                styles.challengeFill,
                { width: `${Math.min(100, (challenge.currentCount / challenge.targetCount) * 100)}%` }
              ]} />
            </View>
            <View style={styles.challengeBottom}>
              <Text style={styles.challengeProgress}>
                {challenge.currentCount}/{challenge.targetCount}
              </Text>
              <Text style={styles.challengeReward}>
                +{challenge.xpReward} XP  +{challenge.coinReward} 🪙
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>Cargando retos de la semana...</Text>
        </View>
      )}

      {/* Logros */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>LOGROS</Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS_CATALOG.map(achievement => {
          const unlocked = unlockedAchievements.includes(achievement.id)
          return (
            <View
              key={achievement.id}
              style={[styles.achievementCard, !unlocked && styles.achievementLocked]}
            >
              <Text style={styles.achievementEmoji}>
                {unlocked ? achievement.emoji : '🔒'}
              </Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              {!unlocked && (
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              )}
            </View>
          )
        })}
      </View>

    </ScrollView>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({ emoji, value, label, color, styles }: {
  emoji: string; value: number; label: string; color?: string; styles: ReturnType<typeof createStyles>
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPerk(perk: string): string {
  return perk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

