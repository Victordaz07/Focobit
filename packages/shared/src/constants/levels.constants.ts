export const LEVEL_UNLOCKS: Record<number, string> = {
  2: 'avatar_frame_silver',
  3: 'theme_dark_pro',
  5: 'custom_focus_sounds',
  7: 'weekly_stats_extended',
  10: 'title_focused_one',
  15: 'avatar_frame_gold',
  20: 'theme_neon',
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Aprendiz',
  3: 'Explorador',
  5: 'Constante',
  8: 'Enfocado',
  12: 'Maestro',
  20: 'Leyenda',
}

export function getLevelTitle(level: number): string {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a)
  for (const key of keys) {
    if (level >= key) return LEVEL_TITLES[key]
  }
  return 'Aprendiz'
}
