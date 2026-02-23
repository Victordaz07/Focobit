// Bridge para comunicación con Apple Watch via WatchConnectivity
// Se implementa como módulo nativo en el proyecto iOS de Expo

import { NativeModules, Platform } from 'react-native'

interface WatchBridgeModule {
  sendAuthToWatch: (userId: string, token: string) => Promise<void>
  isWatchReachable: () => Promise<boolean>
  sendTaskUpdate: (taskId: string, status: string) => Promise<void>
}

const { WatchBridge } = NativeModules

export const watchBridge: WatchBridgeModule = {
  sendAuthToWatch: async (userId: string, token: string) => {
    if (Platform.OS !== 'ios' || !WatchBridge) return
    return WatchBridge.sendAuthToWatch(userId, token)
  },
  isWatchReachable: async () => {
    if (Platform.OS !== 'ios' || !WatchBridge) return false
    return WatchBridge.isWatchReachable()
  },
  sendTaskUpdate: async (taskId: string, status: string) => {
    if (Platform.OS !== 'ios' || !WatchBridge) return
    return WatchBridge.sendTaskUpdate(taskId, status)
  },
}
