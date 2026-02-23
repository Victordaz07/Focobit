# Checklist TestFlight — Focobit

## Pre-requisitos
- [ ] Cuenta Apple Developer ($99/año) en developer.apple.com
- [ ] App creada en App Store Connect (appstoreconnect.apple.com)
- [ ] EAS CLI instalado: `npm install -g eas-cli`
- [ ] Login: `eas login` con tu Apple ID

## Configurar EAS
1. `cd apps/mobile`
2. `eas init` — crea el proyecto y obtén el projectId
3. Pega el projectId en app.config.ts → extra.eas.projectId
4. Rellena en eas.json: appleId, ascAppId, appleTeamId

## Build para TestFlight
```bash
# Build de producción para iOS
eas build --platform ios --profile production

# El proceso tarda 15-30 min en los servidores de Expo
# Al terminar obtienes un .ipa descargable
```

## Subir a TestFlight
```bash
# Automático con EAS Submit
eas submit --platform ios --profile production

# O manual: descarga el .ipa y súbelo en Xcode → Organizer
```

## Assets necesarios antes del build
- [ ] `assets/icon.png` — 1024×1024 px, sin transparencia, sin bordes redondeados
- [ ] `assets/splash.png` — 1284×2778 px (iPhone 14 Pro Max)
- [ ] `assets/adaptive-icon.png` — 1024×1024 px para Android

## App Store Connect — campos mínimos
- [ ] Nombre: Focobit
- [ ] Subtítulo: Foco y tareas para TDAH
- [ ] Descripción (mínimo 100 caracteres)
- [ ] Keywords: tdah, foco, tareas, productividad, adhd
- [ ] Screenshots: iPhone 6.7" (al menos 3)
- [ ] Privacy Policy URL (obligatorio)
- [ ] Categoría principal: Productividad

## Generar screenshots rápido
```bash
# Expo permite screenshots del simulador
eas build --platform ios --profile development
# Corre en simulador y usa Cmd+S para screenshots
```

## Privacy Policy mínima
Puedes usar https://app-privacy-policy-generator.firebaseapp.com/
Súbela a GitHub Pages o a cualquier URL pública.
