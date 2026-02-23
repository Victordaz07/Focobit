import { getFirebaseApp } from './client'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth'

let authInstance: Auth | null = null

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp())
  }
  return authInstance
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
}

// Recibe el idToken desde @react-native-google-signin/google-signin
export async function signInWithGoogleCredential(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken)
  return signInWithCredential(getFirebaseAuth(), credential)
}

// Recibe identityToken desde expo-apple-authentication
export async function signInWithAppleCredential(identityToken: string, nonce: string) {
  const provider = new OAuthProvider('apple.com')
  const credential = provider.credential({ idToken: identityToken, rawNonce: nonce })
  return signInWithCredential(getFirebaseAuth(), credential)
}

export async function signOutUser() {
  return signOut(getFirebaseAuth())
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}

// Solo para web (usa popup nativo del browser)
export async function signInWithGoogleWeb() {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
}

export type { User }
