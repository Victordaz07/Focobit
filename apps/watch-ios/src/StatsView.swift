import SwiftUI

struct StatsView: View {
    @EnvironmentObject var vm: FocobiViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                if let gam = vm.gamProfile {
                    StatRow(emoji: "⚡", label: "Nivel", value: "\(gam.level)")
                    StatRow(emoji: "🔥", label: "Racha", value: "\(gam.streakDays)d")
                    StatRow(emoji: "✅", label: "Tareas", value: "\(gam.totalTasksCompleted)")
                    StatRow(emoji: "⏱", label: "Focus", value: "\(gam.totalFocusSessions)")
                    StatRow(emoji: "🪙", label: "Monedas", value: "\(gam.coins)")
                } else {
                    ProgressView()
                }
            }
            .padding(.horizontal, 8)
        }
        .navigationTitle("Stats")
    }
}

struct StatRow: View {
    let emoji: String
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(emoji)
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(.bold)
        }
        .padding(.vertical, 4)
    }
}
