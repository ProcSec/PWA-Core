import { Report, ReportLogger } from ".."

Report.newHook((report) => { ReportLogger.process(report) }, "Console")
Report.add("Inited", ["report"])
