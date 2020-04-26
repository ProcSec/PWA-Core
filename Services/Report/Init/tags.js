import { ReportTag, ReportTags } from ".."

ReportTags.add(
    new ReportTag("default",
        {
            priority: -1,
        }),
)

const tags = [
    new ReportTag("report",
        {
            badge: {
                bg: "#12bd93",
                text: "#FFFFFF",
                sign: "Report",
                print: true,
            },
        }),
    new ReportTag("report.session",
        {
            badge: {
                text: "#000000",
                bg: "#ff9800",
                sign: "Session",
                print: true,
            },
        }),
    new ReportTag("report.storage",
        {
            badge: {
                text: "#000000",
                bg: "#ff9800",
                sign: "Storage",
                print: true,
            },
        }),

    new ReportTag("report.storage.error",
        {
            badge: {
                sign: "DB Error",
                print: true,
            },
            level: 3,
        }),

    new ReportTag("report.unknownTag",
        {
            badge: {
                sign: "Unknown Tag",
                print: true,
            },
            level: 3,
        }),

    new ReportTag("report.hookError",
        {
            badge: {
                sign: "Processing Error",
                print: true,
            },
            level: 3,
        }),
    new ReportTag("report.session.hookError",
        {
            badge: {
                sign: "Property Hook Error",
                print: true,
            },
            level: 3,
        }),
    new ReportTag("report.session.update",
        {
            badge: {
                sign: "Property",
            },
            displayLevel: -1,
            level: 1,
        }),
    new ReportTag("report.storage.hookError",
        {
            badge: {
                sign: "Hook Error",
                print: true,
            },
            level: 3,
        }),

]

tags.forEach((t) => ReportTags.add(t))
