import Foundation
import Combine
import ClockKit

@MainActor
class FocobiViewModel: ObservableObject {

    @Published var tasks: [WatchTask] = []
    @Published var gamProfile: WatchGamProfile?
    @Published var isLoading = true
    @Published var authToken: String = ""
    @Published var userId: String = ""

    // Recibir token desde iPhone via WatchConnectivity
    func configure(userId: String, token: String) {
        self.userId = userId
        self.authToken = token
        Task {
            await loadData()
        }
    }

    func loadData() async {
        async let tasksResult = fetchTasks()
        async let gamResult = fetchGamProfile()
        self.tasks = (try? await tasksResult) ?? []
        self.gamProfile = try? await gamResult
        self.isLoading = false

        // Actualizar complication con datos frescos
        if let gam = self.gamProfile {
            UserDefaults.standard.set(gam.xp, forKey: "complication_xp")
            UserDefaults.standard.set(gam.streakDays, forKey: "complication_streak")
            UserDefaults.standard.set(gam.level, forKey: "complication_level")
            let server = CLKComplicationServer.sharedInstance()
            server.activeComplications?.forEach { server.reloadTimeline(for: $0) }
        }

        // Escuchar actualizaciones de tareas desde iPhone (solo una vez)
        if !hasTaskObserver {
            hasTaskObserver = true
            NotificationCenter.default.addObserver(
                forName: NSNotification.Name("TaskUpdated"),
                object: nil,
                queue: .main
            ) { [weak self] notification in
                guard let self = self,
                      let taskId = notification.userInfo?["taskId"] as? String,
                      let status = notification.userInfo?["status"] as? String else { return }
                self.tasks = self.tasks.map { t in
                    t.id == taskId ? WatchTask(
                        id: t.id, title: t.title, status: status,
                        energyRequired: t.energyRequired, priority: t.priority,
                        microSteps: t.microSteps
                    ) : t
                }
            }
        }
    }

    private var hasTaskObserver = false

    // MARK: - Firestore REST

    private func fetchTasks() async throws -> [WatchTask] {
        let url = URL(string: "\(FocobiConfig.firestoreBaseURL)/users/\(userId)/tasks")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(FirestoreListResponse.self, from: data)

        return response.documents?.compactMap { doc in
            parseTask(from: doc)
        } ?? []
    }

    private func fetchGamProfile() async throws -> WatchGamProfile {
        let url = URL(string: "\(FocobiConfig.firestoreBaseURL)/users/\(userId)/gamification/profile")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        let doc = try JSONDecoder().decode(FirestoreDocument.self, from: data)
        return parseGamProfile(from: doc)
    }

    func completeTask(_ taskId: String) async {
        let url = URL(string: "\(FocobiConfig.firestoreBaseURL)/users/\(userId)/tasks/\(taskId)?updateMask.fieldPaths=status")!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "fields": ["status": ["stringValue": "done"]]
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        _ = try? await URLSession.shared.data(for: request)

        tasks = tasks.map { t in
            t.id == taskId ? WatchTask(id: t.id, title: t.title, status: "done", energyRequired: t.energyRequired, priority: t.priority, microSteps: t.microSteps) : t
        }
    }

    // MARK: - Firestore parsing helpers

    private func parseTask(from doc: FirestoreDocument) -> WatchTask? {
        guard let fields = doc.fields,
              let title = fields["title"]?.stringValue,
              let status = fields["status"]?.stringValue
        else { return nil }

        let id = doc.name?.components(separatedBy: "/").last ?? UUID().uuidString
        let energy = fields["energyRequired"]?.stringValue ?? "medium"
        let priority = fields["priority"]?.stringValue ?? "normal"
        var microSteps: [WatchMicroStep] = []
        if let arr = fields["microSteps"]?.arrayValue?.values {
            for val in arr {
                if let step = parseMicroStep(val) { microSteps.append(step) }
            }
        }
        return WatchTask(id: id, title: title, status: status, energyRequired: energy, priority: priority, microSteps: microSteps)
    }

    private func parseMicroStep(_ value: FirestoreFieldValue) -> WatchMicroStep? {
        guard let mapValue = value.mapValue,
              let fields = mapValue.fields,
              let id = fields["id"]?.stringValue,
              let title = fields["title"]?.stringValue
        else { return nil }
        let done = fields["done"]?.booleanValue ?? false
        let durationMin = fields["durationMin"]?.integerValue.flatMap { Int($0) }
        return WatchMicroStep(id: id, title: title, done: done, durationMin: durationMin)
    }

    private func parseGamProfile(from doc: FirestoreDocument) -> WatchGamProfile {
        let fields = doc.fields ?? [:]
        return WatchGamProfile(
            xp: Int(fields["xp"]?.integerValue ?? "0") ?? 0,
            level: Int(fields["level"]?.integerValue ?? "1") ?? 1,
            streakDays: Int(fields["streakDays"]?.integerValue ?? "0") ?? 0,
            streakState: fields["streakState"]?.stringValue ?? "active",
            coins: Int(fields["coins"]?.integerValue ?? "0") ?? 0,
            totalTasksCompleted: Int(fields["totalTasksCompleted"]?.integerValue ?? "0") ?? 0,
            totalFocusSessions: Int(fields["totalFocusSessions"]?.integerValue ?? "0") ?? 0
        )
    }
}

// MARK: - Firestore REST models
struct FirestoreListResponse: Codable {
    let documents: [FirestoreDocument]?
}

struct FirestoreDocument: Codable {
    let name: String?
    let fields: [String: FirestoreFieldValue]?
}

struct FirestoreFieldValue: Codable {
    let stringValue: String?
    let integerValue: String?
    let booleanValue: Bool?
    let arrayValue: FirestoreArrayValue?
    let mapValue: FirestoreMapValue?
}

struct FirestoreArrayValue: Codable {
    let values: [FirestoreFieldValue]?
}

struct FirestoreMapValue: Codable {
    let fields: [String: FirestoreFieldValue]?
}
