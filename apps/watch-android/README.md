# Focobit — Wear OS App

## Stack
- Jetpack Compose for Wear OS
- Horologist (componentes oficiales de Google para Wear)
- Firebase REST API
- Data Layer API para sincronización con Android

## Setup
1. Abre Android Studio
2. New Project → Wear OS → Blank Wear App
3. Min SDK: API 30 (Wear OS 3.0)
4. Package: com.focobit.wear

## Dependencias en build.gradle
```
implementation("androidx.wear.compose:compose-material:1.3.0")
implementation("androidx.wear.compose:compose-foundation:1.3.0")
implementation("com.google.android.horologist:horologist-compose-layout:0.6.0")
implementation("com.google.android.gms:play-services-wearable:18.1.0")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")
```
