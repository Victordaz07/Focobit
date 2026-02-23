'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signUpWithEmail, signInWithGoogleWeb } from '@focobit/firebase-config'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await signInWithGoogleWeb()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error con Google')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Focobit</div>
        <p style={s.sub}>{isSignUp ? 'Crear cuenta' : 'Bienvenido de vuelta'}</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            style={s.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Cargando...' : isSignUp ? 'Registrarme' : 'Entrar'}
          </button>
        </form>

        <button style={s.googleBtn} onClick={handleGoogle} type="button">
          <span>G</span> Continuar con Google
        </button>

        <button style={s.switchBtn} onClick={() => setIsSignUp(!isSignUp)} type="button">
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: 'var(--surface)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 },
  logo: { fontSize: 32, fontWeight: 800, color: 'var(--accent)', textAlign: 'center' },
  sub: { color: 'var(--text-muted)', textAlign: 'center', fontSize: 15 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: 'var(--bg)', border: '1px solid var(--surface2)', borderRadius: 10, padding: '12px 16px', color: 'var(--text)', fontSize: 15, outline: 'none' },
  btn: { background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 700 },
  googleBtn: { background: 'var(--surface2)', color: 'var(--text)', borderRadius: 10, padding: '13px 0', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  switchBtn: { color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', background: 'none' },
  error: { color: 'var(--danger)', fontSize: 13 },
}
