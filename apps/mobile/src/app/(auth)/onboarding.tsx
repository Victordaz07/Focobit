import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useOnboardingStore, useAuthStore } from '../../stores'
import { createUserProfile } from '@focobit/firebase-config'
import type { EnergyProfile, ReminderStyle, OnboardingGoal } from '@focobit/shared'

const GOALS = [
  { id: 'work' as OnboardingGoal, emoji: '💼', label: 'Trabajo / estudio' },
  { id: 'health' as OnboardingGoal, emoji: '💪', label: 'Salud y ejercicio' },
  { id: 'home' as OnboardingGoal, emoji: '🏠', label: 'Tareas del hogar' },
  { id: 'creative' as OnboardingGoal, emoji: '🎨', label: 'Proyectos creativos' },
  { id: 'social' as OnboardingGoal, emoji: '👥', label: 'Vida social' },
]

const STEPS = ['Bienvenida', 'Energía', 'Recordatorios', 'Metas', 'Listo']

export default function OnboardingScreen() {
  const { user } = useAuthStore()
  const {
    step, energy, reminderStyle, goals,
    setStep, setEnergy, setReminderStyle, toggleGoal,
  } = useOnboardingStore()
  const [saving, setSaving] = useState(false)

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    try {
      await createUserProfile(user.uid, {
        displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Usuario',
        email: user.email ?? '',
        energyProfile: energy,
        reminderStyle,
        goals,
      })
      router.replace('/(main)/today')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={s.container}>

      {/* Progress dots */}
      <View style={s.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[s.dot, i <= step && s.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Paso 0 — Bienvenida */}
        {step === 0 && (
          <View style={s.slide}>
            <Text style={s.bigEmoji}>🧠</Text>
            <Text style={s.heading}>Bienvenido a Focobit</Text>
            <Text style={s.sub}>
              Diseñado para mentes que funcionan diferente.{'\n'}
              Sin culpa, sin presión, con foco.
            </Text>
            <View style={s.featureList}>
              {[
                { emoji: '⚡', text: 'Tareas por nivel de energía' },
                { emoji: '🎯', text: 'Micro pasos con IA' },
                { emoji: '🔥', text: 'Racha flexible — nunca te penalizamos' },
                { emoji: '🌊', text: 'Modo crisis para días difíciles' },
              ].map(f => (
                <View key={f.text} style={s.featureRow}>
                  <Text style={s.featureEmoji}>{f.emoji}</Text>
                  <Text style={s.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Paso 1 — Energía */}
        {step === 1 && (
          <View style={s.slide}>
            <Text style={s.bigEmoji}>🔋</Text>
            <Text style={s.heading}>¿Cuándo tienes más energía?</Text>
            <Text style={s.sub}>Personalizamos tus tareas para cuando mejor puedas.</Text>
            <View style={s.optionGrid}>
              {([
                { id: 'morning' as EnergyProfile, emoji: '🌅', label: 'Por la mañana', sub: 'Antes del mediodía' },
                { id: 'afternoon' as EnergyProfile, emoji: '🌇', label: 'Por la tarde', sub: 'Después de comer' },
                { id: 'variable' as EnergyProfile, emoji: '🌀', label: 'Varía mucho', sub: 'Depende del día' },
              ]).map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[s.optionCard, energy === opt.id && s.optionCardActive]}
                  onPress={() => setEnergy(opt.id)}
                >
                  <Text style={s.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[s.optionLabel, energy === opt.id && s.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={s.optionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Paso 2 — Recordatorios */}
        {step === 2 && (
          <View style={s.slide}>
            <Text style={s.bigEmoji}>🔔</Text>
            <Text style={s.heading}>¿Cómo prefieres los recordatorios?</Text>
            <Text style={s.sub}>Puedes cambiar esto más adelante.</Text>
            <View style={s.optionList}>
              {([
                { id: 'gentle' as ReminderStyle, emoji: '💙', label: 'Suave', sub: '"Oye, cuando puedas..." sin urgencia' },
                { id: 'direct' as ReminderStyle, emoji: '🎯', label: 'Directo', sub: '"Es hora de hacer X" claro y simple' },
                { id: 'minimal' as ReminderStyle, emoji: '🤫', label: 'Mínimo', sub: 'Solo lo importante, sin ruido' },
              ]).map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[s.listCard, reminderStyle === opt.id && s.listCardActive]}
                  onPress={() => setReminderStyle(opt.id)}
                >
                  <Text style={s.listEmoji}>{opt.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.listLabel, reminderStyle === opt.id && s.listLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={s.listSub}>{opt.sub}</Text>
                  </View>
                  {reminderStyle === opt.id && (
                    <Text style={{ color: '#6C63FF', fontSize: 18 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Paso 3 — Metas */}
        {step === 3 && (
          <View style={s.slide}>
            <Text style={s.bigEmoji}>🎯</Text>
            <Text style={s.heading}>¿En qué áreas quieres enfocarte?</Text>
            <Text style={s.sub}>Selecciona las que más importan ahora.</Text>
            <View style={s.goalsGrid}>
              {GOALS.map(goal => {
                const selected = goals.includes(goal.id)
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[s.goalCard, selected && s.goalCardActive]}
                    onPress={() => toggleGoal(goal.id)}
                  >
                    <Text style={s.goalEmoji}>{goal.emoji}</Text>
                    <Text style={[s.goalLabel, selected && s.goalLabelActive]}>
                      {goal.label}
                    </Text>
                    {selected && <View style={s.goalCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Paso 4 — Listo */}
        {step === 4 && (
          <View style={s.slide}>
            <Text style={s.bigEmoji}>🚀</Text>
            <Text style={s.heading}>¡Todo listo!</Text>
            <Text style={s.sub}>
              Empieza con una sola tarea.{'\n'}
              No tienes que hacerlo todo hoy.
            </Text>
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Tu configuración</Text>
              <Text style={s.summaryLine}>
                🔋 Energía: {energy === 'morning' ? 'Mañana' : energy === 'afternoon' ? 'Tarde' : 'Variable'}
              </Text>
              <Text style={s.summaryLine}>
                🔔 Recordatorios: {reminderStyle === 'gentle' ? 'Suave' : reminderStyle === 'direct' ? 'Directo' : 'Mínimo'}
              </Text>
              <Text style={s.summaryLine}>
                🎯 Metas: {goals.length === 0 ? 'Ninguna seleccionada' : goals.map(g =>
                  GOALS.find(gl => gl.id === g)?.label ?? g
                ).join(', ')}
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Navegación */}
      <View style={s.navRow}>
        {step > 0 ? (
          <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={s.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {step < 4 ? (
          <TouchableOpacity
            style={[s.nextBtn, step === 3 && goals.length === 0 && s.nextBtnSoft]}
            onPress={() => setStep(step + 1)}
          >
            <Text style={s.nextBtnText}>
              {step === 3 && goals.length === 0 ? 'Saltar →' : 'Continuar →'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.nextBtn, saving && s.nextBtnSoft]}
            onPress={handleFinish}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.nextBtnText}>¡Empezar! 🚀</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E17', paddingTop: 56 },
  dotsRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingHorizontal: 24, marginBottom: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#2A2A40' },
  dotActive: { backgroundColor: '#6C63FF' },
  scroll: { padding: 24, paddingBottom: 16 },
  slide: { alignItems: 'center', gap: 16 },
  bigEmoji: { fontSize: 72, marginBottom: 8 },
  heading: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  sub: { color: '#A7A9BE', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  featureList: { width: '100%', gap: 12, marginTop: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14 },
  featureEmoji: { fontSize: 22, width: 32 },
  featureText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  optionGrid: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  optionCard: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent' },
  optionCardActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { color: '#A7A9BE', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  optionLabelActive: { color: '#FFFFFF' },
  optionSub: { color: '#A7A9BE', fontSize: 11, textAlign: 'center' },
  optionList: { width: '100%', gap: 10, marginTop: 8 },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  listCardActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  listEmoji: { fontSize: 24, width: 36 },
  listLabel: { color: '#A7A9BE', fontWeight: '700', fontSize: 15 },
  listLabelActive: { color: '#FFFFFF' },
  listSub: { color: '#A7A9BE', fontSize: 13, marginTop: 2 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginTop: 8 },
  goalCard: { width: '47%', backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  goalCardActive: { borderColor: '#6C63FF', backgroundColor: '#1E1B3A' },
  goalEmoji: { fontSize: 28 },
  goalLabel: { color: '#A7A9BE', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  goalLabelActive: { color: '#FFFFFF' },
  goalCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 20, width: '100%', gap: 10 },
  summaryTitle: { color: '#A7A9BE', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  summaryLine: { color: '#FFFFFF', fontSize: 15 },
  navRow: { flexDirection: 'row', padding: 24, paddingTop: 12, gap: 12 },
  backBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#1A1A2E', alignItems: 'center' },
  backBtnText: { color: '#A7A9BE', fontWeight: '600', fontSize: 15 },
  nextBtn: { flex: 2, padding: 16, borderRadius: 14, backgroundColor: '#6C63FF', alignItems: 'center' },
  nextBtnSoft: { backgroundColor: '#3A3560' },
  nextBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
})
