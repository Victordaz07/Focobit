import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp } from './client'

export interface AIMicroStep {
  id: string
  title: string
  done: boolean
  durationMin?: number
}

export async function generateMicroStepsForTask(
  taskTitle: string,
  energyLevel: 'low' | 'medium' | 'high' = 'medium'
): Promise<AIMicroStep[]> {
  const functions = getFunctions(getFirebaseApp())
  const generate = httpsCallable<
    { taskTitle: string; energyLevel: string },
    { steps: AIMicroStep[] }
  >(functions, 'generateMicroSteps')

  const result = await generate({ taskTitle, energyLevel })
  return result.data.steps
}
