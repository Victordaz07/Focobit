import { SkillName } from '../types/gamification.types'

export const SKILL_PERKS: Record<SkillName, Record<number, string>> = {
  focus: {
    1: 'unlock_focus_10min',
    2: 'focus_ambient_sounds',
    3: 'unlock_focus_20min',
    4: 'focus_stats_detail',
    5: 'unlock_focus_45min',
  },
  order: {
    1: 'task_templates_basic',
    2: 'smart_sort_by_energy',
    3: 'recurring_tasks',
    4: 'task_templates_advanced',
    5: 'bulk_task_actions',
  },
  consistency: {
    1: 'streak_shield_1x_month',
    2: 'weekly_challenges_unlock',
    3: 'streak_shield_2x_month',
    4: 'custom_routines_unlimited',
    5: 'streak_multiplier_1_2x',
  },
  energy: {
    1: 'energy_checkin_reminder',
    2: 'smart_task_suggestions',
    3: 'energy_weekly_patterns',
    4: 'crisis_mode_advanced',
    5: 'energy_ai_coach',
  },
}

export const SKILL_XP_SOURCES: Record<string, SkillName> = {
  focusSession: 'focus',
  taskComplete: 'order',
  routineComplete: 'consistency',
  checkIn: 'energy',
  activeDay: 'consistency',
}
