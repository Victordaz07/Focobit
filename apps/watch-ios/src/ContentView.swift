import SwiftUI

struct ContentView: View {
    @EnvironmentObject var vm: FocobiViewModel

    var body: some View {
        if vm.isLoading {
            LoadingView()
        } else {
            TabView {
                TodayView()
                    .tabItem { Label("Hoy", systemImage: "sun.max") }
                TasksView()
                    .tabItem { Label("Tareas", systemImage: "checkmark.circle") }
                FocusView()
                    .tabItem { Label("Focus", systemImage: "timer") }
                StatsView()
                    .tabItem { Label("Stats", systemImage: "bolt") }
            }
            .environmentObject(vm)
        }
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 8) {
            ProgressView()
            Text("Focobit").font(.caption2).foregroundColor(.purple)
        }
    }
}
