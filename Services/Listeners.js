export default class Listeners {
    static #registry = new Map()

    static add(element, name, callback, options = {}) {
        if (!("addEventListener" in element)
            || typeof element.addEventListener !== "function") throw new TypeError("Element does not support events")

        const id = { element, name, options }
        const record = (this.#registry.get(id) || {}).callbacks || []

        const listener = (...params) => {
            record.forEach((call) => {
                try {
                    call(...params)
                } catch (e) {
                    // Function error won't stop the cycle
                }
            })
        }

        if (record.filter((a) => a).length === 0) {
            element.addEventListener(name, listener, options)
        }

        record.push(callback)
        this.#registry.set({ listener, callbacks: record })

        return record.length
    }

    static remove(element, name, options, number) {
        const id = { element, name, options }
        const recordObj = this.#registry.get(id) || { listener: null, callbacks: null }
        const record = recordObj.callbacks || []
        const { listener } = recordObj

        if (number in record) {
            delete record[number]

            if (record.filter((a) => a).length === 0) {
                element.removeEventListener(name, listener, options)
            }
            return true
        }

        throw new Error("No such listener registred")
    }

    static get(element, name, options, number = null) {
        const lookup = this.#registry.get({ element, name, options }) || false
        return (number !== null && lookup ? lookup.callbacks[number] : lookup)
    }
}
