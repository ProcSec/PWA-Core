import FieldChecker from "@Core/Tools/validation/fieldChecker"
import Transformator from "./Transformator"

export default class TransformatorsRegistry {
    static #registry = new Set()

    static #instances = new Map()

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

        this.#registry.add(tfConstructor)
        return true
    }

    static addInstance(id, tf, description = null) {
        if (!(tf instanceof Transformator)) throw new TypeError("Transformator instance expected")
        if (this.#instances.has(id)) throw new Error("This ID is already set")

        tf.tfRegistryDescription = description

        this.#instances.set(id, tf)
        return true
    }

    static getAll() {
        return Array.from(this.#registry)
    }

    static getAllInstnces() {
        return Array.from(this.#instances.values())
    }

    static getOfType(type) {
        return Array.from(this.#registry).filter((e) => e.type === type)
    }

    static getOfTypeInstances(type) {
        return Array.from(this.#instances.values()).filter((e) => e.constructor.type === type)
    }

    static getByID(id) {
        return Array.from(this.#registry).find((e) => e.id === id)
    }

    static getByIDInstance(id) {
        return this.#instances.get(id)
    }
}
