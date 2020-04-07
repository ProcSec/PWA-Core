import SettingsLayout from "./layout"


export default class SettingsLayoutManager {
    static #layout = false

    static applyLayout(l) {
        if (!(l instanceof SettingsLayout)) throw new TypeError("Only Settings Layout can be applied")

        this.#layout = l
    }

    static get layout() {
        return this.#layout
    }
}
