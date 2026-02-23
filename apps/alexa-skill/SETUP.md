# Setup Alexa Skill — Focobit

## 1. Crear la Skill en Alexa Developer Console

1. Ve a developer.amazon.com/alexa/console/ask
2. Crear skill → nombre: "Focobit"
3. Modelo: Custom
4. Método de alojamiento: Provision your own
5. Plantilla: Start from Scratch
6. Clic en "Create Skill"

## 2. Configurar el modelo de interacción

1. En la skill → Build → Interaction Model → JSON Editor
2. Pega el contenido de interaction-model.json
3. Save Model → Build Model (tarda 1-2 min)

## 3. Crear la Lambda en AWS

1. Ve a console.aws.amazon.com/lambda
2. Create function → Author from scratch
3. Nombre: focobit-alexa-skill
4. Runtime: Node.js 18.x
5. Create function

## 4. Subir el código

```bash
cd apps/alexa-skill
npm install
zip -r skill.zip index.js package.json node_modules/
```

En Lambda → Upload from → .zip file → sube skill.zip

## 5. Configurar variable de entorno en Lambda

En Lambda → Configuration → Environment variables:
- Key: FIREBASE_SERVICE_ACCOUNT
- Value: (contenido del JSON de service account de Firebase)

Para obtener el service account:
Firebase Console → Project Settings → Cuentas de servicio
→ Generar nueva clave privada → descarga el JSON
→ copia todo el contenido como valor de la variable

## 6. Vincular Lambda con la Skill

En Alexa Developer Console:
1. Build → Endpoint
2. AWS Lambda ARN → pega el ARN de tu función Lambda
3. Save Endpoints

## 7. Vinculación de cuenta en la app

Para que Alexa sepa qué usuario de Focobit eres,
agrega en Ajustes de la app un botón "Vincular Alexa"
que guarda el alexaUserId en tu perfil de Firestore.

## 8. Probar

En Alexa Developer Console → Test → habilita "Development"
Escribe: "open focobit"
Prueba: "cuántas tareas tengo"
