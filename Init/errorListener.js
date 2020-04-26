import { Report } from "@Core/Services/Report"

window.addEventListener("error", (e) => {
    Report.add(e, ["core.error"])
})

window.addEventListener("unhandledrejection", (e) => {
    Report.add(e.reason, ["core.error.promise"])
})

window.addEventListener("DOMController-Report", (e) => {
    if (e.detail.type === "log") Report.add(e.detail.data, ["dom.log"])
    if (e.detail.type === "warn") Report.add(e.detail.data, ["dom.warn"])
    if (e.detail.type === "error") Report.add(e.detail.data, ["dom.error"])
})
