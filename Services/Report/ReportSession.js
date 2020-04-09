import randomString from "@Core/Tools/objects/randomString"

export default class ReportSession {
    static start = Date.now()

    static #id = `${Math.floor(Date.now() / 8640000).toString(36)}/${randomString(9)}`

    static #props = {}

    static props = new Proxy(this.#props, {
        set: this.onPropChange,
    })

    static get id() {
        return this.#id
    }

    static init() {

    }

    static onPropChange() {

    }
}
