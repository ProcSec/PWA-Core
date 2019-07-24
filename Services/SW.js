import Report from "./report"
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
        if ("serviceWorker" in navigator) {
            try {
                navigator.serviceWorker.register("/sw.js", { scope: "/" })
                    .then(e => this.success(e))
                    .catch(e => this.fail(e))
            } catch (e) {
                return false
            }
            return true
        }
        return false
    }

    static success(registration, callback) {
        SW.plannedPromptCheck()

        if (!navigator.serviceWorker.controller) {
            return
        }
        this.registration = registration

        let preventDevToolsReloadLoop
        navigator.serviceWorker.addEventListener("controllerchange", (event) => {
            if (preventDevToolsReloadLoop) return
            preventDevToolsReloadLoop = true
            Report.write("Ready to reload")
            SW.onUpdate()
        })

        SW.newOne(registration, () => {
            SW.newSWEvent(registration)
        })
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
        Report.write("New app update found")
    }

    static applyUpdate(registration) {
        if (!registration.waiting) {
            return
        }

        registration.waiting.postMessage("skipWaiting")
    }

    static fail(error) {
        Report.write("SW Error", error)
    }

    static async onUpdate() {
        this.updatePending = true

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
}
