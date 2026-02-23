import SwiftUI

struct TodayView: View {
    @EnvironmentObject var vm: FocobiViewModel

    var pendingTasks: [WatchTask] {
        Array(vm.tasks.filter { $0.status == "pending" }.prefix(3))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {

                // Header XP
                if let gam = vm.gamProfile {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Nivel \(gam.level)")
                                .font(.headline)
                                .foregroundColor(.purple)
                            Text("\(gam.xp) XP")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        HStack(spacing: 2) {
                            Text("🔥")
                            Text("\(gam.streakDays)d")
                                .font(.caption)
                                .foregroundColor(gam.streakState == "paused" ? .orange : .white)
                        }
                    }
                    .padding(.horizontal, 4)
                }

                Divider()

                // Tareas del día
                if pendingTasks.isEmpty {
                    Text("✅ Todo listo por hoy")
                        .font(.caption)
                        .foregroundColor(.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 8)
                } else {
                    ForEach(pendingTasks) { task in
                        TaskRowView(task: task)
                    }
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
        }
        .navigationTitle("Hoy")
    }
}

struct TaskRowView: View {
    let task: WatchTask
    @EnvironmentObject var vm: FocobiViewModel

    var body: some View {
        Button(action: { Task { await vm.completeTask(task.id) } }) {
            HStack(spacing: 8) {
                Circle()
                    .stroke(Color.purple, lineWidth: 2)
                    .frame(width: 18, height: 18)
                Text(task.title)
                    .font(.caption)
                    .lineLimit(2)
                    .foregroundColor(.white)
                Spacer()
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
}
