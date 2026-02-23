export const COLLECTIONS = {
  USERS: 'users',
  TASKS: (userId: string) => `users/${userId}/tasks`,
  ROUTINES: (userId: string) => `users/${userId}/routines`,
  FOCUS_SESSIONS: (userId: string) => `users/${userId}/focusSessions`,
  CHECK_INS: (userId: string) => `users/${userId}/checkIns`,
  GAMIFICATION: (userId: string) => `users/${userId}/gamification`,
  SKILLS: (userId: string) => `users/${userId}/skills`,
  ACHIEVEMENTS: (userId: string) => `users/${userId}/achievements`,
  CHALLENGES: (userId: string) => `users/${userId}/challenges`,
} as const
