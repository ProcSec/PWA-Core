import randomString from "@Core/Tools/objects/randomString"
import Report from "./Report"

export default class ReportSession {
    #start = Date.now()

    #id = `${Math.floor(Date.now() / 8640000).toString(36)}/${randomString(9)}`

    #props = {}

    props = new Proxy(this.#props, {
        set: this.onPropChange,
    })

    get id() {
        return this.#id
    }

    static onPropChange(...params) {
        this.#hooks.forEach((hook) => {
            try {
                hook.hook(...params)
            } catch (e) {
                Report.add([hook.name, e], ["report.session.hook_error"])
            }
        })
    }

    static #hooks = []

    static newHook(hook, name) {
        if (typeof hook !== "function") throw new TypeError("Function expected")
        if (typeof name !== "string") throw new TypeError("Name must be string")
        this.#hooks.push({ hook, name })
    }
}
