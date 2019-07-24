import "@App/loaders/Presets"
import "@App/debug/recovery"

import "@EnvResources/styles/constructor.css"
import "@Resources/styles/constructor.css"

import "./Loaders"

import App from "../Services/app"
import Report from "../Services/report"

if (process.env.NODE_ENV === "development") {
    require("@App/debug/dev")
}


Report.writeNoTrace(`%c   APP   %c ${App.appName}`, "background: #3f51b5; color: #ffffff", "")
Report.writeNoTrace(`%c VERSION %c ${App.version} (${App.branch}) / ${App.buildDate}`, "background: #3f51b5; color: #ffffff", "")
Report.writeNoTrace(`%c  DEBUG  %c ${App.debug}`, "background: #3f51b5; color: #ffffff", "")
Report.writeNoTrace("")
