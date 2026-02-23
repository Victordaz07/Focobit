import SwiftUI

struct TasksView: View {
    @EnvironmentObject var vm: FocobiViewModel

    var pending: [WatchTask] {
        vm.tasks.filter { $0.status == "pending" }
    }

    var body: some View {
        List(pending) { task in
            HStack {
                Button(action: { Task { await vm.completeTask(task.id) } }) {
                    Image(systemName: "circle")
                        .foregroundColor(.purple)
                        .font(.caption)
                }
                .buttonStyle(.plain)
                Text(task.title)
                    .font(.caption2)
                    .lineLimit(2)
            }
        }
        .navigationTitle("Tareas")
        .overlay {
            if pending.isEmpty {
                Text("✅ Sin pendientes")
                    .font(.caption)
                    .foregroundColor(.green)
            }
        }
    }
}
