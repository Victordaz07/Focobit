'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthChanged, signOutUser } from '@focobit/firebase-config'
import type { User } from '@focobit/firebase-config'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',          label: '📊 Dashboard' },
  { href: '/dashboard/tasks',    label: '✅ Tareas' },
  { href: '/dashboard/routines', label: '🔄 Rutinas' },
  { href: '/dashboard/focus',    label: '⏱ Focus' },
  { href: '/dashboard/progress', label: '⚡ Progreso' },
  { href: '/dashboard/settings', label: '⚙️ Ajustes' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    return onAuthChanged(u => {
      if (!u) router.push('/login')
      setUser(u)
      setChecking(false)
    })
  }, [router])

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--accent)', fontSize: 18 }}>Cargando...</div>
    </div>
  )

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>Focobit</div>

        <nav style={s.nav}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...s.navItem,
                ...(pathname === item.href ? s.navItemActive : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.userInfo}>
            <div style={s.userAvatar}>
              {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={s.userName}>
                {user?.displayName ?? user?.email?.split('@')[0]}
              </div>
              <div style={s.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={s.signOutBtn} onClick={() => signOutUser().then(() => router.push('/login'))}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>{children}</main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 240, background: 'var(--surface)', display: 'flex', flexDirection: 'column', padding: '24px 0', borderRight: '1px solid var(--surface2)', position: 'sticky', top: 0, height: '100vh' },
  sidebarLogo: { fontSize: 22, fontWeight: 800, color: 'var(--accent)', padding: '0 20px 24px' },
  nav: { display: 'flex', flexDirection: 'column', flex: 1 },
  navItem: { padding: '12px 20px', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, transition: 'all 0.15s', borderLeft: '3px solid transparent' },
  navItemActive: { color: 'var(--text)', background: 'var(--accent-dim)', borderLeftColor: 'var(--accent)' },
  sidebarBottom: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 4px' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  signOutBtn: { fontSize: 13, color: 'var(--text-muted)', padding: '8px 4px', textAlign: 'left' },
  main: { flex: 1, overflow: 'auto' },
}
