import SwiftUI
import WatchKit

struct FocusView: View {
    @EnvironmentObject var vm: FocobiViewModel
    @State private var duration = 10
    @State private var isRunning = false
    @State private var secondsLeft = 600
    @State private var timer: Timer?

    let durations = [5, 10, 15, 20, 25]

    var body: some View {
        VStack(spacing: 8) {
            if !isRunning {
                Text("Focus")
                    .font(.headline)
                Picker("Duración", selection: $duration) {
                    ForEach(durations, id: \.self) { d in
                        Text("\(d)min").tag(d)
                    }
                }
                .pickerStyle(.wheel)
                .frame(height: 60)

                Button("▶ Iniciar") {
                    startTimer()
                }
                .buttonStyle(.borderedProminent)
                .tint(.purple)
            } else {
                Text(formatTime(secondsLeft))
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .foregroundColor(.purple)

                ProgressView(value: Double(duration * 60 - secondsLeft), total: Double(duration * 60))
                    .tint(.purple)

                Button("✕ Salir") {
                    stopTimer()
                }
                .foregroundColor(.red)
                .font(.caption)
            }
        }
        .padding(.horizontal, 8)
        .navigationTitle("Focus")
    }

    func startTimer() {
        secondsLeft = duration * 60
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if secondsLeft > 0 {
                secondsLeft -= 1
            } else {
                stopTimer()
                WKInterfaceDevice.current().play(.success)
            }
        }
    }

    func stopTimer() {
        timer?.invalidate()
        timer = nil
        isRunning = false
    }

    func formatTime(_ s: Int) -> String {
        String(format: "%02d:%02d", s / 60, s % 60)
    }
}
