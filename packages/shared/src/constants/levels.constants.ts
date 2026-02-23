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
  1: 'Explorador',
  2: 'Aprendiz',
  3: 'Activador',
  4: 'Enfocado',
  5: 'Constante',
  6: 'Flujo',
  7: 'Maestro del Foco',
  8: 'Arquitecto',
  9: 'Leyenda TDAH',
  10: 'Modo Dios 🔥',
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, 10)] ?? `Nivel ${level}`
}

export function getLevelColor(level: number): string {
  if (level <= 2) return '#A7A9BE'
  if (level <= 4) return '#4ECDC4'
  if (level <= 6) return '#6C63FF'
  if (level <= 8) return '#FF9500'
  return '#FFD60A'
}
