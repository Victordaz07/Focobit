import Foundation
import WatchConnectivity

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {

    static let shared = WatchConnectivityManager()
    @Published var receivedUserId: String = ""
    @Published var receivedToken: String = ""
    @Published var isAuthenticated: Bool = false

    private override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
        loadPersistedAuth()
    }

    // MARK: - Recibir auth desde iPhone

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            if let userId = message["userId"] as? String,
               let token = message["token"] as? String {
                self.receivedUserId = userId
                self.receivedToken = token
                self.isAuthenticated = true
                UserDefaults.standard.set(userId, forKey: "watch_userId")
                UserDefaults.standard.set(token, forKey: "watch_token")
            }
        }
    }

    func session(_ session: WCSession,
                 didReceiveMessage message: [String: Any],
                 replyHandler: @escaping ([String: Any]) -> Void) {
        self.session(session, didReceiveMessage: message)
        replyHandler(["status": "received"])
    }

    // MARK: - Recibir actualizaciones de tareas

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            if let taskId = applicationContext["updatedTaskId"] as? String,
               let status = applicationContext["status"] as? String {
                NotificationCenter.default.post(
                    name: NSNotification.Name("TaskUpdated"),
                    object: nil,
                    userInfo: ["taskId": taskId, "status": status]
                )
            }
        }
    }

    // MARK: - Cargar desde UserDefaults (sesión persistida)

    func loadPersistedAuth() {
        if let userId = UserDefaults.standard.string(forKey: "watch_userId"),
           let token = UserDefaults.standard.string(forKey: "watch_token"),
           !userId.isEmpty, !token.isEmpty {
            DispatchQueue.main.async {
                self.receivedUserId = userId
                self.receivedToken = token
                self.isAuthenticated = true
            }
        }
    }

    // MARK: - WCSessionDelegate required

    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
    func session(_ session: WCSession,
                 activationDidCompleteWith state: WCSessionActivationState,
                 error: Error?) {}
}
