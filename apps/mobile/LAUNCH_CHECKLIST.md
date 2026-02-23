# Checklist de Lanzamiento — Focobit v1.0

## Assets ✅ (generados con script)
- [x] icon.png — 1024×1024
- [x] splash.png — 1284×2778
- [x] adaptive-icon.png — Android
- [x] favicon.png — Web

## Antes del primer build

### Configuración
- [ ] `eas init` en apps/mobile → obtén projectId
- [ ] Actualiza `extra.eas.projectId` en app.config.ts
- [ ] Configura Apple Developer account
- [ ] Crea app en App Store Connect
- [ ] Rellena eas.json con appleId, ascAppId, appleTeamId

### Firebase
- [ ] Habilitar App Check en Firebase Console (protección anti-abuse)
- [ ] Agregar dominio de producción a Auth → Authorized domains
- [ ] Configurar presupuesto de alerta en Firebase Billing

### API Keys
- [ ] Gemini API key configurada: `firebase functions:config:set gemini.key="..."`
- [ ] Verificar functions config: `firebase functions:config:get`

## Build iOS (TestFlight)
```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Build Android (Play Store Internal)
```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

## App Store Connect — campos requeridos
- [ ] Nombre: Focobit
- [ ] Subtítulo: Tareas y foco para TDAH
- [ ] Descripción larga (ver STORE_DESCRIPTION.md)
- [ ] Keywords: tdah, adhd, foco, tareas, concentración, productividad, rutinas
- [ ] Screenshots iPhone 6.7" — mínimo 3
- [ ] Screenshots iPad (si aplica)
- [ ] Privacy Policy URL: https://TU_DOMINIO/privacy-policy
- [ ] Categoría: Productividad
- [ ] Clasificación de edad: 4+
- [ ] URL de soporte: https://TU_DOMINIO

## Google Play Console
- [ ] App bundle (.aab) subido
- [ ] Ficha de Play Store completa
- [ ] Privacy Policy URL
- [ ] Grupo de pruebas internos configurado

## Post-lanzamiento semana 1
- [ ] Monitorear Firebase Crashlytics
- [ ] Revisar reviews en ambas stores
- [ ] Verificar Cloud Functions en Firebase Console
- [ ] Comprobar que las push notifications llegan
