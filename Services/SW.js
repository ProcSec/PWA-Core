import delayAction from "@Core/Tools/objects/delayAction"
import PWA from "@App/modules/main/PWA"
import { Report } from "./Report"
import SettingsStorage from "./Settings/SettingsStorage"

/* eslint-disable consistent-return */

export default class SW {
    static updatePending = false

    static registration = false

    static userPrompt() { }

    static unregister() {
        if ("serviceWorker" in navigator) {
            return this.registration.unregister()
        }
        return false
    }

    static update() {
        if ("serviceWorker" in navigator) {
            return this.registration.update()
        }
        return false
    }

    static register() {
        const self = this
        return new Promise((resolve, reject) => {
            if (!("serviceWorker" in navigator)) reject(new Error("ServiceWorker is not supported"))
            try {
                navigator.serviceWorker.register("/sw.js", { scope: "/" })
                    .then((e) => self.success(e, [resolve, reject]))
                    .catch((e) => self.fail(e, [resolve, reject]))
            } catch (e) {
                reject(e)
            }
            resolve()
        })
    }

    static success(registration, [resolve, reject]) {
        try {
            this.registration = registration
            this.SWWaiters.reduce((p, func) => p.then(async () => {
                try {
                    await func(registration)
                } catch (e) {
                    // Observe error
                }
            }), Promise.resolve())

            SW.plannedPromptCheck()

            resolve()

            if (!navigator.serviceWorker.controller) {
                return
            }

            let preventDevToolsReloadLoop
            navigator.serviceWorker.addEventListener("controllerchange", (event) => {
                if (preventDevToolsReloadLoop) return
                preventDevToolsReloadLoop = true
                Report.add([], ["sw.reloadReady"])
                SW.onUpdate()
            })

            SW.newOne(registration, () => {
                SW.newSWEvent(registration)
            })
        } catch (e) {
            reject(e)
        }
    }

    static newOne(registration, callback) {
        if (registration.waiting) {
            return callback()
        }

        function listenInstalledStateChange() {
            registration.installing.addEventListener("statechange", (event) => {
                if (event.target.state === "installed") {
                    callback()
                }
            })
        }

        if (registration.installing) {
            return listenInstalledStateChange()
        }

        registration.addEventListener("updatefound", listenInstalledStateChange)
    }

    static newSWEvent(registration) {
        Report.add([], ["sw.newUpdate"])
    }

    static applyUpdate(registration) {
        if (!registration.waiting) {
            return
        }

        registration.waiting.postMessage("skipWaiting")
    }

    static fail(error, [resolve, reject]) {
        Report.add(error, ["sw.error"])
        reject(error)
    }

    static async onUpdate() {
        this.updatePending = true

        if (PWA.analyticsAllowed) {
            delayAction(() => {
                window.gtag("event", "update_recieved", {
                    event_category: "app",
                    non_interaction: true,
                })
            })
        }

        const gottaDelay = await SettingsStorage.get("user_update_prompt_later")
        if (gottaDelay) {
            SettingsStorage.set("update_prompt_planned", true)
            return
        }

        this.userPrompt()
    }

    static async plannedPromptCheck() {
        const gottaFire = await SettingsStorage.get("update_prompt_planned")
        if (gottaFire) {
            SettingsStorage.set("update_prompt_planned", false)
            this.userPrompt(true)
        }
    }

    static SWWaiters = []

    static onSW(func) {
        this.SWWaiters.push(func)
    }
}
