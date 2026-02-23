# Eventos de Analytics — Focobit

## Eventos clave (KPIs)

| Evento | Cuándo se dispara | Parámetros |
|--------|-------------------|------------|
| `onboarding_completed` | Al terminar onboarding | energy_profile, reminder_style, goals_count |
| `task_created` | Al crear tarea | energy_required, priority, has_due_date |
| `task_completed` | Al completar tarea | had_micro_steps, energy_required, priority |
| `micro_steps_generated` | Al usar IA | energy_level, step_count |
| `focus_started` | Al iniciar sesión | duration_min, has_linked_task |
| `focus_completed` | Al terminar sesión | duration_min, xp_earned |
| `focus_abandoned` | Al salir antes | duration_min, seconds_elapsed |
| `level_up` | Al subir nivel | new_level, total_xp |
| `achievement_unlocked` | Al desbloquear logro | achievement_id, category |
| `streak_updated` | Al actualizar racha | streak_days, streak_state |
| `crisis_mode_activated` | Al entrar modo crisis | — |
| `routine_created` | Al crear rutina | type, step_count |
| `routine_completed` | Al completar rutina | routine_id, type |

## Funnels importantes en Firebase Console

### Funnel de activación
onboarding_completed → task_created → task_completed → focus_started

### Funnel de retención
streak_updated(day=1) → streak_updated(day=3) → streak_updated(day=7)

### Adopción de IA
task_created → micro_steps_generated → task_completed(had_micro_steps=true)

## Audiencias sugeridas en Firebase

1. **Power Users**: level >= 5 AND streak_days >= 7
2. **At Risk**: last_open > 3 days AND streak_state = 'active'
3. **IA Adopters**: micro_steps_generated >= 3
4. **Crisis Users**: crisis_mode_activated >= 1

## Dashboards a crear en Firebase Console

1. Retención D1, D7, D30
2. Tasa de completación de tareas
3. Uso de micro pasos por IA (% usuarios)
4. Duración promedio de sesiones focus
5. Distribución de niveles de usuarios
