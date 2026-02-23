import ClockKit
import SwiftUI

// Complication provider para mostrar XP/racha en carátula del reloj
class FocobiComplicationProvider: NSObject, CLKComplicationDataSource {

    func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
        let descriptors = [
            CLKComplicationDescriptor(
                identifier: "focobit.main",
                displayName: "Focobit",
                supportedFamilies: [
                    .modularSmall,
                    .utilitarianSmall,
                    .circularSmall,
                    .graphicCorner,
                    .graphicCircular,
                ]
            )
        ]
        handler(descriptors)
    }

    func getCurrentTimelineEntry(
        for complication: CLKComplication,
        withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
    ) {
        let xp = UserDefaults.standard.integer(forKey: "complication_xp")
        let streak = UserDefaults.standard.integer(forKey: "complication_streak")
        let level = UserDefaults.standard.integer(forKey: "complication_level")
        let safeLevel = level > 0 ? level : 1

        let entry = makeEntry(for: complication, xp: xp, streak: streak, level: safeLevel)
        handler(entry)
    }

    private func makeEntry(
        for complication: CLKComplication,
        xp: Int, streak: Int, level: Int
    ) -> CLKComplicationTimelineEntry? {
        let date = Date()

        switch complication.family {
        case .graphicCorner:
            let template = CLKComplicationTemplateGraphicCornerTextImage(
                textProvider: CLKSimpleTextProvider(text: "Nv.\(level) 🔥\(streak)d"),
                imageProvider: CLKFullColorImageProvider(
                    fullColorImage: UIImage(systemName: "brain") ?? UIImage()
                )
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .graphicCircular:
            let template = CLKComplicationTemplateGraphicCircularStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "Nv\(level)"),
                line2TextProvider: CLKSimpleTextProvider(text: "🔥\(streak)")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .modularSmall:
            let template = CLKComplicationTemplateModularSmallStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "Nv.\(level)"),
                line2TextProvider: CLKSimpleTextProvider(text: "🔥\(streak)d")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .utilitarianSmall:
            let template = CLKComplicationTemplateUtilitarianSmallFlat(
                textProvider: CLKSimpleTextProvider(text: "⚡Nv.\(level)")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .circularSmall:
            let template = CLKComplicationTemplateCircularSmallStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "Nv\(level)"),
                line2TextProvider: CLKSimpleTextProvider(text: "🔥\(streak)")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        default:
            return nil
        }
    }

    func getTimelineEndDate(
        for complication: CLKComplication,
        withHandler handler: @escaping (Date?) -> Void
    ) {
        handler(nil)
    }

    func getPrivacyBehavior(
        for complication: CLKComplication,
        withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void
    ) {
        handler(.showOnLockScreen)
    }
}
