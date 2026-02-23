# Focobit — Alexa Skill

## Setup
1. Cuenta en developer.amazon.com
2. Crear skill en Alexa Developer Console
3. Tipo: Custom
4. Modelo de interacción: Custom
5. Backend: AWS Lambda (Node.js 18)

## Invocación
"Alexa, abre Focobit"
"Alexa, dile a Focobit que agregue una tarea"
"Alexa, pregunta a Focobit cuántas tareas tengo hoy"

## Deploy
```bash
cd apps/alexa-skill
npm install
zip -r skill.zip index.js package.json node_modules/
# Sube skill.zip a AWS Lambda
```
