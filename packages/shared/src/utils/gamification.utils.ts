import { XP_PER_LEVEL } from '../constants/xp.constants'

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1
}

export function xpToNextLevel(totalXP: number): number {
  return XP_PER_LEVEL - (totalXP % XP_PER_LEVEL)
}

export function xpProgressInCurrentLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL
}

export function xpProgressPercent(totalXP: number): number {
  return Math.round((xpProgressInCurrentLevel(totalXP) / XP_PER_LEVEL) * 100)
}
