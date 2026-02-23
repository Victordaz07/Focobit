import { Tabs } from 'expo-router'

export default function MainLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="today" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tareas' }} />
      <Tabs.Screen name="focus" options={{ title: 'Focus' }} />
      <Tabs.Screen name="routines" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso' }} />
    </Tabs>
  )
}
