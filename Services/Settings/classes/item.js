import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import Navigation from "@Core/Services/navigation"
import { SettingsGroup } from "."

export default class SettingsItem {
    #data = {}

    #parent = false

    generatedInstance = false

    constructor(data, parent) {
        if (!(parent instanceof SettingsGroup)) throw new TypeError("Only Settings Group can be a parrent")

        this.#parent = parent

        new FieldsContainer([
            ["id", "dom", "options"],
            {
                id: new FieldChecker({ type: "string", symbols: "a-zA-Z0-9-" }),
                display: new FieldChecker({ type: "function" }),
                locked: new FieldChecker({ type: "function" }),
                dom: new FieldChecker({ type: "function" }),
                events: new FieldsContainer([
                    [],
                    {
                        onupdate: new FieldChecker({ type: "function" }),
                        onfail: new FieldChecker({ type: "function" }),
                    },
                ]),
                options: new FieldChecker({ type: "object" }),
            },
        ]).set(data)

        this.#data = data
    }

    get id() {
        return this.#data.id
    }

    get onupdate() {
        return (e) => {
            this.#parent.onupdate()
            if (typeof this.#data.events.onupdate === "function") return this.#data.events.onupdate()
            return true
        }
    }

    get onfail() {
        return (e) => {
            this.#parent.onfail()
            if (typeof this.#data.events.onfail === "function") return this.#data.events.onfail()
            return true
        }
    }

    get parent() {
        return this.#parent
    }

    get layout() {
        return this.#parent.layout
    }

    async render() {
        if ("display" in this.#data && !(await this.#data.display())) {
            return false
        }
        // eslint-disable-next-line new-cap
        this.generatedInstance = await new this.#data.dom(this.#data.options, Navigation.parse)
        return this.generatedInstance
    }
}
