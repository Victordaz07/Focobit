import { create } from 'zustand'
import type { AppTheme } from '@focobit/shared'
import { THEMES } from '@focobit/shared'

interface ThemeState {
  theme: AppTheme
  themeId: string
  setTheme: (id: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: THEMES.default,
  themeId: 'default',
  setTheme: (id: string) => {
    const theme = THEMES[id] ?? THEMES.default
    set({ theme, themeId: id })
  },
}))
