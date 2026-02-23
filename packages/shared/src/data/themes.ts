export interface AppTheme {
  id: string
  accent: string
  accentDim: string
  accentLight: string
  bg: string
  surface: string
  surface2: string
  text: string
  textMuted: string
  green: string
  danger: string
}

export const THEMES: Record<string, AppTheme> = {
  default: {
    id: 'default',
    accent: '#6C63FF',
    accentDim: '#1E1B3A',
    accentLight: '#9B8FFF',
    bg: '#0F0E17',
    surface: '#1A1A2E',
    surface2: '#2A2A40',
    text: '#FFFFFF',
    textMuted: '#A7A9BE',
    green: '#4ECDC4',
    danger: '#FF6B6B',
  },
  theme_ocean: {
    id: 'theme_ocean',
    accent: '#0EA5E9',
    accentDim: '#0C1A2E',
    accentLight: '#38BDF8',
    bg: '#050D1A',
    surface: '#0C1A2E',
    surface2: '#162840',
    text: '#E0F2FE',
    textMuted: '#7CB9D8',
    green: '#34D399',
    danger: '#F87171',
  },
  theme_forest: {
    id: 'theme_forest',
    accent: '#22C55E',
    accentDim: '#0A1F0F',
    accentLight: '#4ADE80',
    bg: '#071A0C',
    surface: '#0D2414',
    surface2: '#163520',
    text: '#DCFCE7',
    textMuted: '#86EFAC',
    green: '#34D399',
    danger: '#F87171',
  },
  theme_sunset: {
    id: 'theme_sunset',
    accent: '#F97316',
    accentDim: '#2A1200',
    accentLight: '#FB923C',
    bg: '#1A0A00',
    surface: '#2A1400',
    surface2: '#3D2000',
    text: '#FFF7ED',
    textMuted: '#FDB07A',
    green: '#34D399',
    danger: '#F87171',
  },
  theme_midnight: {
    id: 'theme_midnight',
    accent: '#818CF8',
    accentDim: '#0A0A14',
    accentLight: '#A5B4FC',
    bg: '#020207',
    surface: '#0A0A14',
    surface2: '#14141F',
    text: '#E0E7FF',
    textMuted: '#6B7280',
    green: '#34D399',
    danger: '#F87171',
  },
  theme_aurora: {
    id: 'theme_aurora',
    accent: '#A855F7',
    accentDim: '#1A0A2E',
    accentLight: '#C084FC',
    bg: '#080014',
    surface: '#120020',
    surface2: '#1E0033',
    text: '#F5F3FF',
    textMuted: '#C4B5FD',
    green: '#34D399',
    danger: '#F87171',
  },
}
