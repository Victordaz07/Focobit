import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Focobit — Dashboard',
  description: 'Tu panel de control para el foco y la constancia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
