import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.join(__dirname, '../assets')

await mkdir(assetsDir, { recursive: true })

// SVG del ícono de Focobit (sin texto para compatibilidad cross-platform)
const iconSVG = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1A1A2E"/>
      <stop offset="100%" stop-color="#0F0E17"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#6C63FF" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#6C63FF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Fondo -->
  <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>

  <!-- Glow -->
  <ellipse cx="512" cy="460" rx="300" ry="280" fill="url(#glow)"/>

  <!-- Cerebro simplificado -->
  <g transform="translate(512,480)" fill="none" stroke="#6C63FF" stroke-width="22" stroke-linecap="round">
    <!-- Hemisferio izquierdo -->
    <path d="M-20,-160 C-120,-160 -220,-80 -220,40 C-220,140 -140,200 -60,210 C-40,212 -20,210 -20,210"/>
    <!-- Hemisferio derecho -->
    <path d="M20,-160 C120,-160 220,-80 220,40 C220,140 140,200 60,210 C40,212 20,210 20,210"/>
    <!-- División central -->
    <line x1="0" y1="-170" x2="0" y2="220"/>
    <!-- Surcos izquierdo -->
    <path d="M-80,-100 C-140,-60 -160,20 -120,80"/>
    <path d="M-40,-40 C-100,0 -120,60 -100,120"/>
    <!-- Surcos derecho -->
    <path d="M80,-100 C140,-60 160,20 120,80"/>
    <path d="M40,-40 C100,0 120,60 100,120"/>
  </g>

  <!-- Nodos de conexión (gamificación) -->
  <circle cx="512" cy="220" r="16" fill="#6C63FF" opacity="0.9"/>
  <circle cx="340" cy="340" r="12" fill="#9B59B6" opacity="0.7"/>
  <circle cx="684" cy="340" r="12" fill="#9B59B6" opacity="0.7"/>
  <circle cx="280" cy="520" r="10" fill="#6C63FF" opacity="0.5"/>
  <circle cx="744" cy="520" r="10" fill="#6C63FF" opacity="0.5"/>

  <!-- Líneas de conexión -->
  <g stroke="#6C63FF" stroke-width="2" opacity="0.3">
    <line x1="512" y1="220" x2="340" y2="340"/>
    <line x1="512" y1="220" x2="684" y2="340"/>
    <line x1="340" y1="340" x2="280" y2="520"/>
    <line x1="684" y1="340" x2="744" y2="520"/>
  </g>

  <!-- Punto central brillante -->
  <circle cx="512" cy="320" r="8" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="512" cy="320" r="20" fill="#6C63FF" opacity="0.2"/>

  <!-- XP badge pequeño (sin texto para compatibilidad) -->
  <rect x="380" y="700" width="264" height="72" rx="36" fill="#6C63FF" opacity="0.9"/>
</svg>
`

// Generar icon.png 1024x1024
await sharp(Buffer.from(iconSVG))
  .resize(1024, 1024)
  .png()
  .toFile(path.join(assetsDir, 'icon.png'))
console.log('✓ icon.png generado')

// Adaptive icon para Android (sin bordes redondeados)
const adaptiveSVG = iconSVG.replace('rx="180"', 'rx="0"')
await sharp(Buffer.from(adaptiveSVG))
  .resize(1024, 1024)
  .png()
  .toFile(path.join(assetsDir, 'adaptive-icon.png'))
console.log('✓ adaptive-icon.png generado')

// Favicon web 32x32
await sharp(Buffer.from(iconSVG))
  .resize(32, 32)
  .png()
  .toFile(path.join(assetsDir, 'favicon.png'))
console.log('✓ favicon.png generado')

// Splash 1284x2778 (iPhone 14 Pro Max)
const splashSVG = `
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashGlow" cx="50%" cy="42%" r="35%">
      <stop offset="0%" stop-color="#6C63FF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#6C63FF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1284" height="2778" fill="#0F0E17"/>
  <ellipse cx="642" cy="1160" rx="500" ry="460" fill="url(#splashGlow)"/>
  <!-- Ícono centrado más pequeño -->
  <g transform="translate(642,1100) scale(0.55)">
    <g transform="translate(0,60)" fill="none" stroke="#6C63FF" stroke-width="22" stroke-linecap="round">
      <path d="M-20,-160 C-120,-160 -220,-80 -220,40 C-220,140 -140,200 -60,210 C-40,212 -20,210 -20,210"/>
      <path d="M20,-160 C120,-160 220,-80 220,40 C220,140 140,200 60,210 C40,212 20,210 20,210"/>
      <line x1="0" y1="-170" x2="0" y2="220"/>
      <path d="M-80,-100 C-140,-60 -160,20 -120,80"/>
      <path d="M80,-100 C140,-60 160,20 120,80"/>
    </g>
    <circle cx="0" cy="-100" r="16" fill="#6C63FF" opacity="0.9"/>
    <circle cx="0" cy="-20" r="8" fill="#FFFFFF" opacity="0.9"/>
  </g>
  <!-- Texto -->
  <text x="642" y="1420" font-family="Arial, sans-serif" font-size="80"
    font-weight="800" fill="#FFFFFF" text-anchor="middle">Focobit</text>
  <text x="642" y="1500" font-family="Arial, sans-serif" font-size="36"
    fill="#A7A9BE" text-anchor="middle">Foco sin culpa</text>
</svg>
`

await sharp(Buffer.from(splashSVG))
  .resize(1284, 2778)
  .png()
  .toFile(path.join(assetsDir, 'splash.png'))
console.log('✓ splash.png generado')

console.log('\n✅ Todos los assets generados en apps/mobile/assets/')
