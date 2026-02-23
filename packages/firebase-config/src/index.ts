export { getFirebaseApp } from './client'
export { COLLECTIONS } from './collections'
export {
  getFirebaseAuth, signInWithEmail, signUpWithEmail,
  signInWithGoogleCredential, signInWithAppleCredential,
  signOutUser, onAuthChanged, signInWithGoogleWeb,
} from './auth'
export type { User } from './auth'
export {
  getFirestoreDb, doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit,
  getDocs, onSnapshot, serverTimestamp, Timestamp,
} from './firestore'
export { createUserProfile, getUserProfile, getGamificationProfile } from './userService'
export {
  createTask, getUserTasks, subscribeToTasks,
  completeTask, updateTaskStatus,
  updateTaskMicroSteps, toggleMicroStep,
} from './taskService'
export {
  startFocusSession, completeFocusSession, abandonFocusSession,
} from './focusService'
export {
  awardXPForAction, addSkillXP, updateStreak,
} from './gamificationService'
export {
  createRoutine, subscribeToRoutines,
  completeRoutineStep, completeRoutine, deleteRoutine,
} from './routineService'
export {
  getOrCreateWeeklyChallenges, subscribeToWeeklyChallenges,
} from './challengesService'
export type { Challenge, WeeklyChallenge } from './challengesService'
export {
  getUnlockedAchievements, checkAndUnlockAchievements,
  ACHIEVEMENTS_CATALOG,
} from './achievementsService'
export type { Achievement } from './achievementsService'
export { generateMicroStepsForTask } from './aiService'
export type { AIMicroStep } from './aiService'
export {
  trackTaskCreated, trackTaskCompleted, trackMicroStepsGenerated,
  trackFocusStarted, trackFocusCompleted, trackFocusAbandoned,
  trackLevelUp, trackAchievementUnlocked, trackStreakUpdated,
  trackCrisisMode, trackRoutineCreated, trackRoutineCompleted,
  trackOnboardingStep, trackOnboardingCompleted,
  setAnalyticsUser, trackScreen,
} from './analytics'
