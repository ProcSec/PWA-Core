import insert from "@Core/Tools/transformation/object/arrayInsert"
import SettingsAct from "../classes/act"

export default class SettingsLayout {
    _structure = []

    _map = new Map()

    defaultAct = "settings"

    createAct(p = {}, r = {}) {
        const { id } = p

        if (this._map.has(id)) throw new Error(`Such id (${id}) already exists`)
        const children = []
        const save = new SettingsAct(p, this, children)
        const insertion = { object: save, children }

        this._structure = insert(this._structure, insertion, r)
        this.mapRegister(id, save)
        return this
    }

    getAct(id) {
        const q = this.getByID(id)
        if (!(q instanceof SettingsAct)) return false
        return q
    }

    getByID(id) {
        return this._map.get(id)
    }

    isIdRegistered(id) {
        return this._map.has(id)
    }

    get structure() {
        return this._structure
    }

    mapRegister(id, save) {
        if (this.isIdRegistered(id)) throw Error("Such ID is already registered")
        return this._map.set(id, save)
    }
}
