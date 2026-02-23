const Alexa = require('ask-sdk-core')
const admin = require('firebase-admin')

// Inicializar Firebase Admin con service account
// El service account JSON se configura como variable de entorno en Lambda
let firebaseInitialized = false

function initFirebase() {
  if (firebaseInitialized) return
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'focobit-716b6',
    })
    firebaseInitialized = true
  } catch (e) {
    console.error('Firebase init error:', e)
  }
}

// ─── Intent: Abrir la skill ──────────────────────────────────
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Hola, soy Focobit. Puedes decirme: agregar tarea, cuántas tareas tengo, o iniciar foco. ¿Qué quieres hacer?')
      .reprompt('¿Qué quieres hacer? Puedes agregar una tarea o preguntarme cuántas tienes hoy.')
      .getResponse()
  },
}

// ─── Intent: Ver tareas del día ──────────────────────────────
const GetTodayTasksIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTodayTasksIntent'
  },
  async handle(handlerInput) {
    initFirebase()
    const userId = handlerInput.requestEnvelope.context.System.user.userId

    try {
      const db = admin.firestore()
      const usersSnap = await db.collection('users')
        .where('alexaUserId', '==', userId)
        .limit(1)
        .get()

      if (usersSnap.empty) {
        return handlerInput.responseBuilder
          .speak('Parece que aún no has vinculado tu cuenta de Focobit. Abre la app y ve a Ajustes para vincular Alexa.')
          .getResponse()
      }

      const uid = usersSnap.docs[0].id
      const tasksSnap = await db
        .collection(`users/${uid}/tasks`)
        .where('status', '==', 'pending')
        .get()

      const count = tasksSnap.size
      const speech = count === 0
        ? 'No tienes tareas pendientes hoy. ¡Buen trabajo!'
        : count === 1
        ? `Tienes 1 tarea pendiente: ${tasksSnap.docs[0].data().title}`
        : `Tienes ${count} tareas pendientes. La primera es: ${tasksSnap.docs[0].data().title}`

      return handlerInput.responseBuilder.speak(speech).getResponse()
    } catch (e) {
      return handlerInput.responseBuilder
        .speak('Hubo un error al obtener tus tareas. Intenta de nuevo.')
        .getResponse()
    }
  },
}

// ─── Intent: Agregar tarea ───────────────────────────────────
const AddTaskIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddTaskIntent'
  },
  async handle(handlerInput) {
    initFirebase()
    const slots = handlerInput.requestEnvelope.request.intent.slots
    const taskTitle = slots?.taskName?.value

    if (!taskTitle) {
      return handlerInput.responseBuilder
        .speak('¿Cómo se llama la tarea que quieres agregar?')
        .reprompt('Dime el nombre de la tarea.')
        .addElicitSlotDirective('taskName')
        .getResponse()
    }

    const userId = handlerInput.requestEnvelope.context.System.user.userId

    try {
      const db = admin.firestore()
      const usersSnap = await db.collection('users')
        .where('alexaUserId', '==', userId)
        .limit(1)
        .get()

      if (usersSnap.empty) {
        return handlerInput.responseBuilder
          .speak('Primero vincula tu cuenta de Focobit en la app.')
          .getResponse()
      }

      const uid = usersSnap.docs[0].id
      await db.collection(`users/${uid}/tasks`).add({
        title: taskTitle,
        status: 'pending',
        energyRequired: 'medium',
        priority: 'normal',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'alexa',
      })

      return handlerInput.responseBuilder
        .speak(`Listo, agregué "${taskTitle}" a tus tareas de Focobit.`)
        .getResponse()
    } catch (e) {
      return handlerInput.responseBuilder
        .speak('No pude agregar la tarea. Intenta de nuevo.')
        .getResponse()
    }
  },
}

// ─── Intent: Racha actual ────────────────────────────────────
const GetStreakIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetStreakIntent'
  },
  async handle(handlerInput) {
    initFirebase()
    const userId = handlerInput.requestEnvelope.context.System.user.userId

    try {
      const db = admin.firestore()
      const usersSnap = await db.collection('users')
        .where('alexaUserId', '==', userId)
        .limit(1)
        .get()

      if (usersSnap.empty) {
        return handlerInput.responseBuilder
          .speak('Vincula tu cuenta de Focobit en la app para ver tu racha.')
          .getResponse()
      }

      const uid = usersSnap.docs[0].id
      const gamSnap = await db.doc(`users/${uid}/gamification/profile`).get()
      const gam = gamSnap.data() ?? {}
      const streak = gam.streakDays ?? 0
      const state = gam.streakState ?? 'active'

      const speech = streak === 0
        ? 'Aún no tienes racha. ¡Completa una tarea hoy para empezar!'
        : state === 'paused'
        ? `Tu racha de ${streak} días está en pausa. Tienes 24 horas para recuperarla.`
        : `Llevas ${streak} ${streak === 1 ? 'día' : 'días'} de racha. ¡Sigue así!`

      return handlerInput.responseBuilder.speak(speech).getResponse()
    } catch {
      return handlerInput.responseBuilder
        .speak('No pude obtener tu racha. Intenta de nuevo.')
        .getResponse()
    }
  },
}

// ─── Intent: Ayuda ───────────────────────────────────────────
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Puedes decirme: cuántas tareas tengo, agregar una tarea, o cuál es mi racha. ¿Qué quieres saber?')
      .reprompt('¿Qué quieres hacer?')
      .getResponse()
  },
}

// ─── Intent: Cancelar/Salir ──────────────────────────────────
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('¡Hasta luego! Sigue enfocado.')
      .getResponse()
  },
}

// ─── Error handler ───────────────────────────────────────────
const ErrorHandler = {
  canHandle: () => true,
  handle(handlerInput, error) {
    console.error('Error:', error)
    return handlerInput.responseBuilder
      .speak('Hubo un error. Por favor, intenta de nuevo.')
      .getResponse()
  },
}

// ─── Export ──────────────────────────────────────────────────
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetTodayTasksIntentHandler,
    AddTaskIntentHandler,
    GetStreakIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
