import * as functions from 'firebase-functions'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface GenerateMicroStepsRequest {
  taskTitle: string
  taskContext?: string
  energyLevel?: 'low' | 'medium' | 'high'
}

interface MicroStep {
  id: string
  title: string
  done: boolean
  durationMin?: number
}

export const generateMicroSteps = functions.https.onCall(
  async (data: GenerateMicroStepsRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Login required')
    }

    const { taskTitle, taskContext, energyLevel = 'medium' } = data

    if (!taskTitle?.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'taskTitle is required')
    }

    const apiKey = functions.config().gemini?.key
    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'Gemini API key not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const energyInstructions: Record<string, string> = {
      low: 'El usuario tiene poca energía. Genera pasos muy cortos (1-3 minutos cada uno), simples y concretos.',
      medium: 'El usuario tiene energía normal. Genera pasos manejables (3-7 minutos cada uno).',
      high: 'El usuario tiene mucha energía. Los pasos pueden ser más sustanciales (5-10 minutos cada uno).',
    }

    const prompt = `Eres un asistente especializado en TDAH. Tu trabajo es dividir tareas en micro pasos muy concretos y alcanzables.

Tarea: "${taskTitle}"
${taskContext ? `Contexto adicional: ${taskContext}` : ''}
Nivel de energía: ${energyLevel}
${energyInstructions[energyLevel] ?? energyInstructions.medium}

Genera exactamente 4-5 micro pasos para completar esta tarea. Cada paso debe:
- Ser una acción física concreta (verbo de acción + objeto específico)
- Tomar entre 1-10 minutos máximo
- Ser tan obvio que no requiera pensar
- Comenzar con un verbo de acción (Abrir, Escribir, Buscar, Llamar, etc.)

Responde ÚNICAMENTE con un JSON válido, sin markdown ni explicaciones:
{
  "steps": [
    { "title": "Acción concreta 1", "durationMin": 3 },
    { "title": "Acción concreta 2", "durationMin": 5 }
  ]
}`

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()

      // Limpiar posible markdown
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(clean)

      const steps: MicroStep[] = (parsed.steps ?? []).map((s: { title?: string; durationMin?: number }, i: number) => ({
        id: `step_${Date.now()}_${i}`,
        title: s.title ?? `Paso ${i + 1}`,
        done: false,
        durationMin: s.durationMin,
      }))

      return { steps }
    } catch (error) {
      console.error('Gemini error:', error)
      throw new functions.https.HttpsError('internal', 'Error generating micro steps')
    }
  }
)
