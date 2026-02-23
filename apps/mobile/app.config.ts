import type { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Focobit',
  slug: 'focobit',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0E17',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.focobit.app',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'Focobit necesita acceso a la cámara para la foto de perfil.',
      NSUserNotificationsUsageDescription: 'Focobit envía recordatorios de rutinas y rachas.',
      UIBackgroundModes: ['fetch', 'remote-notification'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F0E17',
    },
    package: 'com.focobit.app',
    versionCode: 1,
    permissions: [
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'POST_NOTIFICATIONS',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-notifications',
    '@react-native-firebase/app',
    [
      'expo-build-properties',
      {
        ios: { deploymentTarget: '16.0' },
        android: { compileSdkVersion: 34, targetSdkVersion: 34, buildToolsVersion: '34.0.0' },
      },
    ],
  ],
  extra: {
    eas: { projectId: 'YOUR_EAS_PROJECT_ID' },
  },
  owner: 'victordaz07',
})
