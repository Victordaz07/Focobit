import SwiftUI

@main
struct FocobiWatchApp: App {
    @StateObject private var vm = FocobiViewModel()
    @StateObject private var connectivity = WatchConnectivityManager.shared

    var body: some Scene {
        WindowGroup {
            Group {
                if connectivity.isAuthenticated {
                    ContentView()
                        .environmentObject(vm)
                        .onAppear {
                            vm.configure(
                                userId: connectivity.receivedUserId,
                                token: connectivity.receivedToken
                            )
                        }
                } else {
                    WaitingForPhoneView()
                }
            }
        }
    }
}

struct WaitingForPhoneView: View {
    @ObservedObject private var connectivity = WatchConnectivityManager.shared

    var body: some View {
        VStack(spacing: 8) {
            Text("🧠")
                .font(.system(size: 32))
            Text("Focobit")
                .font(.headline)
                .foregroundColor(.purple)
            Text("Abre la app en iPhone")
                .font(.caption2)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .onAppear {
            connectivity.loadPersistedAuth()
        }
    }
}
