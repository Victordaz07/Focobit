import Foundation

struct WatchTask: Identifiable, Codable {
    let id: String
    let title: String
    let status: String
    let energyRequired: String
    let priority: String
    var microSteps: [WatchMicroStep]
}

struct WatchMicroStep: Identifiable, Codable {
    let id: String
    let title: String
    var done: Bool
    let durationMin: Int?
}

struct WatchGamProfile: Codable {
    let xp: Int
    let level: Int
    let streakDays: Int
    let streakState: String
    let coins: Int
    let totalTasksCompleted: Int
    let totalFocusSessions: Int
}

struct WatchFocusSession: Codable {
    let durationMin: Int
    let linkedTaskId: String?
}
