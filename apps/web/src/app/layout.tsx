import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Focobit',
  description: 'App para personas con TDAH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
