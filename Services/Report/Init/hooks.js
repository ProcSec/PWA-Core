import {
    Report, ReportLogger, ReportSession, ReportStorage,
} from ".."

ReportStorage.addTransformHook((k, value) => {
    if (value instanceof Error) {
        const error = { "[[SPECIAL]]": "error" }

        Object.getOwnPropertyNames(value).forEach((key) => {
            error[key] = value[key]
        })

        return error
    }
    return value
}, "errors")
ReportSession.newHook((target, prop, value) => {
    Report.add([prop, value], ["report.session.update"])
    target[prop] = value
}, "apply")
Report.newHook((report, options) => { ReportLogger.process(report, options) }, "Console")
Report.newHook((report, options) => { ReportStorage.save(report, options) }, "Console")
