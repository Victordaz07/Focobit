export { getFirebaseApp } from './client'
export { COLLECTIONS } from './collections'
export {
  getFirebaseAuth, signInWithEmail, signUpWithEmail,
  signInWithGoogleCredential, signInWithAppleCredential,
  signInWithGoogleWeb, signOutUser, onAuthChanged,
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
