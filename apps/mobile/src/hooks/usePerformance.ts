// Performance traces para medir tiempos críticos

export async function startTrace(name: string) {
  try {
    const perf = require('@react-native-firebase/perf')
    const trace = await perf.default().startTrace(name)
    return trace
  } catch {
    return null
  }
}

// Uso:
// const trace = await startTrace('generate_micro_steps')
// ... operación ...
// await trace?.stop()
