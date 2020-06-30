import "@Core/Services/Report/Init"
import "./errorListener"
import "@App/loaders/Presets"
import "@App/debug/recovery"

import "@Environment/Loaders/SplashScreenInit"

import "@EnvResources/styles/constructor.css"
import "@Resources/styles/constructor.css"

import "./Loaders"

import { Report } from "@Core/Services/Report"
import App from "../Services/app"

if (process.env.NODE_ENV === "development") {
    require("@App/debug/dev")
}

Report.add(String(App.appName), ["APP"])
Report.add(`${App.version} [${App.build}] (${App.branch}) / ${App.buildDate}`, ["VERSION"])
Report.add(String(App.debug), ["DEBUG"])
Report.add([], ["dummy"])
