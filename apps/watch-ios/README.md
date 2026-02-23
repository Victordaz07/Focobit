# Focobit — Apple Watch App

## Stack
- SwiftUI
- WatchKit
- Firebase REST API (no SDK nativo)
- WatchConnectivity para sincronización con iPhone

## Setup
1. Abre Xcode
2. File → New → Project → watchOS → App
3. Product Name: FocobiWatch
4. Bundle ID: com.focobit.watch
5. Copia los archivos de /src a tu proyecto Xcode

## Arquitectura
- ViewModel central (FocobiViewModel.swift) que consume Firebase REST
- 4 pantallas principales
- Complication para mostrar XP/racha en carátula

## Auth
El token de Firebase se pasa desde la app iPhone via WatchConnectivity.
La app watch NO hace login independiente.

## Variables de entorno
Configura en FocobiConfig.swift:
- FIREBASE_PROJECT_ID: focobit-716b6
- FIREBASE_API_KEY: (tu API key)
