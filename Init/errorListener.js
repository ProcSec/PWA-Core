import Report from "@Core/Services/report"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"

window.addEventListener("error", (e) => {
    Report.saveToDB("Error caught", errorToObject(e))
})
