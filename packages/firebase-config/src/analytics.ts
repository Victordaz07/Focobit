import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { getFirebaseApp } from './client'

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null

function getAnalyticsInstance() {
  if (!analyticsInstance) {
    analyticsInstance = getAnalytics(getFirebaseApp())
  }
  return analyticsInstance
}

// ─── Eventos de tareas ───────────────────────────────────────
export function trackTaskCreated(params: {
  energyRequired: string
  priority: string
  hasDueDate: boolean
}) {
  logEvent(getAnalyticsInstance(), 'task_created', params)
}

export function trackTaskCompleted(params: {
  taskId: string
  hadMicroSteps: boolean
  xpEarned: number
}) {
  logEvent(getAnalyticsInstance(), 'task_completed', params)
}

export function trackMicroStepsGenerated(params: {
  taskTitle: string
  energyLevel: string
  stepCount: number
}) {
  logEvent(getAnalyticsInstance(), 'micro_steps_generated', params)
}

// ─── Eventos de focus ────────────────────────────────────────
export function trackFocusStarted(params: {
  durationMin: number
  hasLinkedTask: boolean
}) {
  logEvent(getAnalyticsInstance(), 'focus_started', params)
}

export function trackFocusCompleted(params: {
  durationMin: number
  xpEarned: number
}) {
  logEvent(getAnalyticsInstance(), 'focus_completed', params)
}

export function trackFocusAbandoned(params: {
  durationMin: number
  secondsElapsed: number
}) {
  logEvent(getAnalyticsInstance(), 'focus_abandoned', params)
}

// ─── Eventos de gamificación ─────────────────────────────────
export function trackLevelUp(params: {
  newLevel: number
  totalXp: number
}) {
  logEvent(getAnalyticsInstance(), 'level_up', params)
}

export function trackAchievementUnlocked(params: {
  achievementId: string
  category: string
}) {
  logEvent(getAnalyticsInstance(), 'achievement_unlocked', params)
}

export function trackStreakUpdated(params: {
  streakDays: number
  streakState: string
}) {
  logEvent(getAnalyticsInstance(), 'streak_updated', params)
}

export function trackCrisisMode() {
  logEvent(getAnalyticsInstance(), 'crisis_mode_activated')
}

// ─── Eventos de rutinas ──────────────────────────────────────
export function trackRoutineCreated(params: { type: string; stepCount: number }) {
  logEvent(getAnalyticsInstance(), 'routine_created', params)
}

export function trackRoutineCompleted(params: { routineId: string; type: string }) {
  logEvent(getAnalyticsInstance(), 'routine_completed', params)
}

// ─── Eventos de onboarding ───────────────────────────────────
export function trackOnboardingStep(step: number) {
  logEvent(getAnalyticsInstance(), 'onboarding_step', { step })
}

export function trackOnboardingCompleted(params: {
  energyProfile: string
  reminderStyle: string
  goalsCount: number
}) {
  logEvent(getAnalyticsInstance(), 'onboarding_completed', params)
}

// ─── Usuario ─────────────────────────────────────────────────
export function setAnalyticsUser(uid: string, properties: {
  energyProfile?: string
  reminderStyle?: string
  level?: number
}) {
  const a = getAnalyticsInstance()
  setUserId(a, uid)
  setUserProperties(a, {
    energy_profile: properties.energyProfile ?? '',
    reminder_style: properties.reminderStyle ?? '',
    user_level: String(properties.level ?? 1),
  })
}

// ─── Pantallas ───────────────────────────────────────────────
export function trackScreen(screenName: string) {
  logEvent(getAnalyticsInstance(), 'screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenName,
  })
}
