import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import {
    Report, ReportLogger, ReportSession, ReportStorage,
} from ".."

ReportStorage.addTransformHook((jk, value) => errorToObject(value), "errors")
ReportSession.newHook((target, prop, value) => {
    Report.add([prop, value], ["report.session.update"])
    target[prop] = value
}, "apply")
Report.newHook((report, options) => { ReportLogger.process(report, options) }, "Console")
Report.newHook((report, options) => { ReportStorage.save(report, options) }, "Console")
