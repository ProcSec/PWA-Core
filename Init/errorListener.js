import Report from "@Core/Services/reportOld"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"

window.addEventListener("error", (e) => {
    Report.saveToDB("Error caught", errorToObject(e))
})

window.addEventListener("unhandledrejection", (e) => {
    Report.saveToDB("Error (in promise) caught", errorToObject(e.reason))
})

window.addEventListener("DOMController-Report", (e) => {
    if (e.detail.type === "log") Report.write(...e.detail.data)
    if (e.detail.type === "warn") Report.warn(...e.detail.data)
    if (e.detail.type === "error") Report.error(...e.detail.data)
})
