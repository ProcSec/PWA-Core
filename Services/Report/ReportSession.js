export default class ReportSession {
    static start = Date.now()

    static id = Math.random().toString(36).substring(2, 15)

    static #props = {}

    static props = new Proxy(this.#props, {
        set: this.onPropChange,
    })

    static init() {

    }

    static onPropChange() {

    }
}
