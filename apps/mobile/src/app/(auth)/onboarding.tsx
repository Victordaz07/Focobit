import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { createUserProfile } from '@focobit/firebase-config'
import { useAuthStore, useOnboardingStore } from '../../stores'
import { EnergyProfile, ReminderStyle, OnboardingGoal } from '@focobit/shared'

const TOTAL_STEPS = 4

export default function OnboardingScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { step, data, nextStep, prevStep, setEnergyProfile, setReminderStyle, toggleGoal } =
    useOnboardingStore()

  async function handleFinish() {
    if (!data.energyProfile || !data.reminderStyle || !data.goals?.length) return

    try {
      const uid = user?.uid ?? 'guest-' + Date.now()
      const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuario'
      const email = user?.email ?? ''

      await createUserProfile(uid, {
        displayName,
        email,
        energyProfile: data.energyProfile,
        reminderStyle: data.reminderStyle,
        goals: data.goals,
        age: data.age,
      })
    } catch (e) {
      console.error('Error saving profile:', e)
    }
    router.replace('/(main)/today')
  }

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < step && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <StepWelcome onNext={nextStep} />
        )}
        {step === 2 && (
          <StepEnergy
            selected={data.energyProfile}
            onSelect={(v) => { setEnergyProfile(v); nextStep() }}
          />
        )}
        {step === 3 && (
          <StepReminders
            selected={data.reminderStyle}
            onSelect={(v) => { setReminderStyle(v); nextStep() }}
          />
        )}
        {step === 4 && (
          <StepGoals
            selected={data.goals ?? []}
            onToggle={toggleGoal}
            onFinish={handleFinish}
          />
        )}
      </ScrollView>

      {step > 1 && (
        <TouchableOpacity style={styles.back} onPress={prevStep}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.emoji}>🧠</Text>
      <Text style={styles.heading}>Hola, soy Focobit</Text>
      <Text style={styles.body}>
        Tu compañero para hacer las cosas sin agobiarte.{'\n\n'}
        No te voy a castigar si fallas. Solo te voy a ayudar a volver.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Empezar →</Text>
      </TouchableOpacity>
    </View>
  )
}

function StepEnergy({
  selected,
  onSelect,
}: {
  selected?: EnergyProfile
  onSelect: (v: EnergyProfile) => void
}) {
  const options: { value: EnergyProfile; label: string; emoji: string }[] = [
    { value: 'morning', label: 'Mañana', emoji: '🌅' },
    { value: 'evening', label: 'Tarde/Noche', emoji: '🌙' },
    { value: 'variable', label: 'Varía mucho', emoji: '🌀' },
  ]
  return (
    <View style={styles.step}>
      <Text style={styles.heading}>¿Cuándo tienes más energía?</Text>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.optionCard, selected === o.value && styles.optionSelected]}
          onPress={() => onSelect(o.value)}
        >
          <Text style={styles.optionEmoji}>{o.emoji}</Text>
          <Text style={styles.optionLabel}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function StepReminders({
  selected,
  onSelect,
}: {
  selected?: ReminderStyle
  onSelect: (v: ReminderStyle) => void
}) {
  const options: { value: ReminderStyle; label: string; desc: string }[] = [
    { value: 'gentle', label: 'Suave', desc: '"Oye, cuando puedas..."' },
    { value: 'direct', label: 'Directo', desc: '"Tienes esto pendiente ahora"' },
    { value: 'minimal', label: 'Mínimo', desc: 'Solo lo urgente' },
  ]
  return (
    <View style={styles.step}>
      <Text style={styles.heading}>¿Cómo prefieres que te recuerde?</Text>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.optionCard, selected === o.value && styles.optionSelected]}
          onPress={() => onSelect(o.value)}
        >
          <Text style={styles.optionLabel}>{o.label}</Text>
          <Text style={styles.optionDesc}>{o.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function StepGoals({
  selected,
  onToggle,
  onFinish,
}: {
  selected: OnboardingGoal[]
  onToggle: (g: OnboardingGoal) => void
  onFinish: () => void
}) {
  const goals: { value: OnboardingGoal; label: string }[] = [
    { value: 'start_tasks', label: '⚡ Empezar tareas sin paralizarme' },
    { value: 'maintain_routines', label: '🔄 Mantener rutinas' },
    { value: 'focus_more', label: '🎯 Concentrarme más' },
    { value: 'remember_things', label: '🧠 No olvidar cosas' },
    { value: 'manage_stress', label: '🌊 Manejar el estrés' },
  ]
  return (
    <View style={styles.step}>
      <Text style={styles.heading}>¿Qué quieres mejorar primero?</Text>
      <Text style={styles.body}>Elige 1 o 2</Text>
      {goals.map((g) => (
        <TouchableOpacity
          key={g.value}
          style={[styles.optionCard, selected.includes(g.value) && styles.optionSelected]}
          onPress={() => onToggle(g.value)}
        >
          <Text style={styles.optionLabel}>{g.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
        onPress={onFinish}
        disabled={selected.length === 0}
      >
        <Text style={styles.buttonText}>¡Empezar! 🚀</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E17', paddingTop: 60 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A2A40' },
  dotActive: { backgroundColor: '#6C63FF', width: 24 },
  content: { padding: 24, paddingBottom: 80 },
  step: { gap: 16 },
  emoji: { fontSize: 56, textAlign: 'center' },
  heading: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  body: { fontSize: 16, color: '#A7A9BE', textAlign: 'center', lineHeight: 24 },
  button: {
    backgroundColor: '#6C63FF', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  optionCard: {
    backgroundColor: '#1A1A2E', borderRadius: 12,
    padding: 16, borderWidth: 2, borderColor: '#2A2A40', gap: 4,
  },
  optionSelected: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  optionEmoji: { fontSize: 28, textAlign: 'center' },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  optionDesc: { fontSize: 13, color: '#A7A9BE' },
  back: { position: 'absolute', bottom: 24, left: 24, padding: 12 },
  backText: { color: '#A7A9BE', fontSize: 15 },
})
