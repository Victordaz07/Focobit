# Pasos exactos para TestFlight

## 1. App Store Connect
1. Ve a https://appstoreconnect.apple.com
2. Mis apps → + Nueva app
3. Plataforma: iOS
4. Nombre: Focobit
5. Idioma: Español
6. Bundle ID: com.focobit.app (debe coincidir con app.config.ts)
7. SKU: focobit-001
8. Acceso de usuario: Acceso completo
9. Guardar

## 2. Obtener datos para eas.json
En App Store Connect:
- Apple ID: tu email de Apple
- ascAppId: el número de App ID (en la URL de tu app)
- appleTeamId: en developer.apple.com → Account → Team ID

Actualiza eas.json:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "tu@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDEF1234"
    }
  }
}
```

## 3. Build y submit en un comando
```bash
eas build --platform ios --profile production --auto-submit
```

## 4. En App Store Connect → TestFlight
1. El build aparece en 5-30 minutos
2. Ir a TestFlight → Builds
3. Completar "Información de prueba" (What to Test)
4. Agregar testers internos (tu email primero)
5. Recibes email de TestFlight → descargar

## 5. Testers externos (opcional)
1. TestFlight → Grupos externos → + Nuevo grupo
2. Agregar emails
3. Enviar invitación
4. Apple revisa en 24-48h la primera vez

## Checklist final antes de submit
- [ ] GoogleService-Info.plist real (no placeholder)
- [ ] google-services.json real (no placeholder)  
- [ ] eas.json con tus datos reales
- [ ] app.config.ts con projectId real de EAS
- [ ] Gemini API key configurada en Firebase Functions
- [ ] Icono sin transparencia (ya generado)
- [ ] Splash sin transparencia (ya generado)
