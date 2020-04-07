import insert from "@Core/Tools/transformation/object/arrayInsert"
import SettingsAct from "../classes/act"

export default class SettingsLayout {
    #structure = []

    #map = new Map()

    defaultAct = "settings"

    createAct(p = {}, r = {}) {
        const { id } = p

        if (this.#map.has(id)) throw new Error(`Such id (${id}) already exists`)
        const children = []
        const save = new SettingsAct(p, this, children)
        const insertion = { object: save, children }

        this.#structure = insert(this.#structure, insertion, r)
        this.mapRegister(id, save)
        return this
    }

    getAct(id) {
        const q = this.getByID(id)
        if (!(q instanceof SettingsAct)) return false
        return q
    }

    getByID(id) {
        return this.#map.get(id)
    }

    isIdRegistered(id) {
        return this.#map.has(id)
    }

    get structure() {
        return this.#structure
    }

    mapRegister(id, save) {
        if (this.isIdRegistered(id)) throw Error("Such ID is already registered")
        return this.#map.set(id, save)
    }
}
