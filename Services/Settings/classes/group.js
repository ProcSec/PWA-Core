import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import Navigation from "@Core/Services/navigation"
import insert from "@Core/Tools/transformation/object/arrayInsert"
import { SettingsSection, SettingsItem } from "."

export default class SettingsGroup {
    #data = {}

    #parent = false

    #children = []

    generatedInstance = false

    constructor(data, parent, children) {
        if (!(parent instanceof SettingsSection)) throw new TypeError("Only Settings Section can be a parrent")
        if (!(Array.isArray(children))) throw new TypeError("Children must be array")

        this.#parent = parent
        this.#children = children

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

    get children() {
        return this.#children
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
        const pr = await Promise.all(this.children.map(async (e) => {
            const rm = await e.object.render()
            return rm
        }))
        pr.forEach((e) => {
            if (e) this.generatedInstance.render(e)
        })
        return this.generatedInstance
    }


    getItem(id) {
        const q = this.layout.getByID(id)
        if (!(q instanceof SettingsItem)) return false
        return q
    }

    createItem(p = {}, r = {}) {
        const { id } = p
        if (this.layout.isIdRegistered(id)) throw new Error("Such ID is already registered")
        const save = new SettingsItem(p, this)
        const insertion = {
            object: save,
        }
        this.#children = insert(this.#children, insertion, r)
        this.layout.mapRegister(id, save)
        return this
    }
}
