'use client'
import { useEffect, useState } from 'react'
import { onAuthChanged, getUserProfile, getFirestoreDb, doc, updateDoc } from '@focobit/firebase-config'
import { COLLECTIONS } from '@focobit/firebase-config'
import type { User } from '@focobit/firebase-config'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [energyProfile, setEnergyProfile] = useState('morning')
  const [reminderStyle, setReminderStyle] = useState('gentle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    return onAuthChanged(async u => {
      if (!u) return
      setUser(u)
      const profile = await getUserProfile(u.uid)
      if (profile) {
        setDisplayName(profile.displayName ?? '')
        setEnergyProfile(profile.energyProfile ?? 'morning')
        setReminderStyle(profile.reminderStyle ?? 'gentle')
      }
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const db = getFirestoreDb()
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      displayName,
      energyProfile,
      reminderStyle,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Ajustes</h1>

      {/* Perfil */}
      <form onSubmit={handleSave} style={s.section}>
        <h2 style={s.sectionTitle}>PERFIL</h2>

        <div style={s.field}>
          <label style={s.label}>Nombre</label>
          <input
            style={s.input}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={{ ...s.input, opacity: 0.5 }} value={user?.email ?? ''} disabled />
        </div>

        <h2 style={{ ...s.sectionTitle, marginTop: 20 }}>PREFERENCIAS</h2>

        <div style={s.field}>
          <label style={s.label}>¿Cuándo tienes más energía?</label>
          <select style={s.select} value={energyProfile} onChange={e => setEnergyProfile(e.target.value)}>
            <option value="morning">🌅 Por la mañana</option>
            <option value="afternoon">🌇 Por la tarde</option>
            <option value="variable">🌀 Varía mucho</option>
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Estilo de recordatorios</label>
          <select style={s.select} value={reminderStyle} onChange={e => setReminderStyle(e.target.value)}>
            <option value="gentle">💙 Suave — sin urgencia</option>
            <option value="direct">🎯 Directo — claro y simple</option>
            <option value="minimal">🤫 Mínimo — solo lo importante</option>
          </select>
        </div>

        <div style={s.saveRow}>
          <button type="submit" style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span style={s.savedMsg}>✓ Cambios guardados</span>}
        </div>
      </form>

      {/* Info de cuenta */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>CUENTA</h2>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>User ID</span>
          <span style={s.infoValue}>{user?.uid ?? '—'}</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Proveedor</span>
          <span style={s.infoValue}>
            {user?.providerData?.[0]?.providerId === 'google.com' ? '🔵 Google' : '📧 Email'}
          </span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Email verificado</span>
          <span style={{ ...s.infoValue, color: user?.emailVerified ? 'var(--green)' : 'var(--danger)' }}>
            {user?.emailVerified ? '✓ Sí' : '✕ No'}
          </span>
        </div>
      </div>

      {/* Zona de peligro */}
      <div style={{ ...s.section, borderColor: 'var(--danger)33' }}>
        <h2 style={{ ...s.sectionTitle, color: 'var(--danger)' }}>ZONA DE PELIGRO</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Estas acciones son irreversibles. Procede con cuidado.
        </p>
        <div style={s.dangerRow}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Exportar mis datos</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Descarga un JSON con toda tu información</div>
          </div>
          <button type="button" style={s.dangerBtn} onClick={() => alert('Próximamente')}>
            📦 Exportar
          </button>
        </div>
        <div style={s.dangerRow}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Eliminar cuenta</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Borra todos tus datos permanentemente</div>
          </div>
          <button type="button" style={{ ...s.dangerBtn, background: 'var(--danger)22', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={() => alert('Próximamente')}>
            🗑 Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 720 },
  heading: { fontSize: 28, fontWeight: 800, marginBottom: 24 },
  section: { background: 'var(--surface)', borderRadius: 14, padding: 24, marginBottom: 16, border: '1px solid var(--surface2)' },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' },
  input: { background: 'var(--bg)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  select: { background: 'var(--bg)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14 },
  saveRow: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 },
  saveBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  saveBtnDisabled: { opacity: 0.5, cursor: 'default' },
  savedMsg: { color: 'var(--green)', fontSize: 14, fontWeight: 600 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface2)' },
  infoLabel: { fontSize: 13, color: 'var(--text-muted)' },
  infoValue: { fontSize: 13, fontWeight: 600 },
  dangerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--surface2)33' },
  dangerBtn: { background: 'var(--surface2)', color: 'var(--text)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--surface2)' },
}
