import * as admin from 'firebase-admin'
admin.initializeApp()

export { onTaskCompleted } from './gamification'
export { checkStreaksPaused, sendRoutineReminders, sendNightRoutineReminders } from './notifications'
export { onWeeklyChallengeTick, generateChallengesForUser } from './challenges'
