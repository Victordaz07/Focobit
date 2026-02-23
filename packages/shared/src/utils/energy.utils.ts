import { Task, EnergyLevel } from '../types/task.types'

export function getTasksByEnergy(tasks: Task[], energy: EnergyLevel): Task[] {
  const energyMap: Record<EnergyLevel, EnergyLevel[]> = {
    high: ['high', 'medium', 'low'],
    medium: ['medium', 'low'],
    low: ['low'],
  }
  const allowed = energyMap[energy]
  return tasks.filter(t => allowed.includes(t.energyRequired) && t.status === 'pending')
}

export function getTopTasksForToday(tasks: Task[], energy: EnergyLevel, max = 3): Task[] {
  const filtered = getTasksByEnergy(tasks, energy)
  const priorityOrder = { urgent: 0, normal: 1, someday: 2 }
  return filtered
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, max)
}

export function getCrisisTask(tasks: Task[]): Task | null {
  return tasks.find(t =>
    t.energyRequired === 'low' &&
    t.status === 'pending' &&
    t.microSteps.length > 0
  ) ?? tasks.find(t => t.energyRequired === 'low' && t.status === 'pending') ?? null
}
