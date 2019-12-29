import FieldChecker from "@Core/Tools/validation/fieldChecker"
import Transformator from "./Transformator"

export default class TransformatorsRegistry {
    static _registry = new Set()

    static _instances = new Map()

    static add(tfConstructor) {
        if (!(tfConstructor === Transformator
            || tfConstructor.prototype instanceof Transformator)) { throw new TypeError("Transformator constructor expected") }


        try {
            new FieldChecker({ type: "string", min: 1, symbols: "a-z0-9-" }).set(tfConstructor.id)
        } catch (e) {
            throw new TypeError("Correct ID expected")
        }
        try {
            new FieldChecker({ type: "string", min: 1 }).set(tfConstructor.name)
        } catch (e) {
            throw new TypeError("Key name expected")
        }

        this._registry.add(tfConstructor)
        return true
    }

    static addInstance(id, tf, description = null) {
        if (!(tf instanceof Transformator)) throw new TypeError("Transformator instance expected")
        if (this._instances.has(id)) throw new Error("This ID is already set")

        tf.__tfRegistryDescription__ = description

        this._instances.set(id, tf)
        return true
    }

    static getAll() {
        return Array.from(this._registry)
    }

    static getAllInstnces() {
        return Array.from(this._instances.values())
    }

    static getOfType(type) {
        return Array.from(this._registry).filter((e) => e.type === type)
    }

    static getOfTypeInstances(type) {
        return Array.from(this._instances.values()).filter((e) => e.constructor.type === type)
    }

    static getByID(id) {
        return Array.from(this._registry).find((e) => e.id === id)
    }

    static getByIDInstance(id) {
        return this._instances.get(id)
    }
}
