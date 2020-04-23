import "@Core/Services/Report/Init"
import "./errorListener"
import "@App/loaders/Presets"
import "@App/debug/recovery"

import "@Environment/Loaders/SplashScreenInit"

import "@EnvResources/styles/constructor.css"
import "@Resources/styles/constructor.css"

import "./Loaders"

import App from "../Services/app"

if (process.env.NODE_ENV === "development") {
    require("@App/debug/dev")
}


console.log(`%c   APP   %c ${App.appName}`, "background: #3f51b5; color: #ffffff", "")
console.log(`%c VERSION %c ${App.version} (${App.branch}) / ${App.buildDate}`, "background: #3f51b5; color: #ffffff", "")
console.log(`%c  DEBUG  %c ${App.debug}`, "background: #3f51b5; color: #ffffff", "")
console.log("")
