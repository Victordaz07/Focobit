import Foundation

enum FocobiConfig {
    static let firebaseProjectId = "focobit-716b6"
    // API key de Firebase (solo para REST, no autenticación)
    // Obtener de: Firebase Console → Project Settings → General
    static let firebaseApiKey = "YOUR_API_KEY"
    static var firestoreBaseURL: String {
        "https://firestore.googleapis.com/v1/projects/\(firebaseProjectId)/databases/(default)/documents"
    }
}
