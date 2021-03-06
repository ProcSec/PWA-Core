import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import DOM from "@DOMPath/DOM/Classes/dom"
import { Title } from "@Environment/Library/DOM/object"
import { Card } from "@Environment/Library/DOM/object/card"
import Navigation from "@Core/Services/navigation"
import insert from "@Core/Tools/transformation/object/arrayInsert"
import SettingsLayout from "../user/layout"
import { SettingsSection } from "."

export default class SettingsAct {
    #data = {}

    generatedInstance = false

    #parent = false

    #children = []

    constructor(data, parent, children) {
        if (!(parent instanceof SettingsLayout)) throw new TypeError("Only Settings Layout can be a parrent")
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
            if (typeof this.#data.events.onupdate === "function") return this.#data.events.onupdate()
            return true
        }
    }

    get onfail() {
        return (e) => {
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
        return this.#parent
    }

    async render() {
        if ("display" in this.#data && !(await this.#data.display())) {
            return new DOM({
                new: "div",
                content: [
                    new Title("Settings"),
                    new Card("There's no available settings for you at the moment"),
                ],
            })
        }
        this.#data.options.lock = (this.#data.lock ? !!this.#data.lock() : false)
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

    getSection(id) {
        const q = this.layout.getByID(id)
        if (!(q instanceof SettingsSection)) return false
        return q
    }

    createSection(p = {}, r = {}) {
        const { id } = p
        if (this.layout.isIdRegistered(id)) throw new Error("Such ID is already registered")
        const children = []
        const save = new SettingsSection(p, this, children)
        const insertion = {
            object: save,
            children,
        }
        this.#children = insert(this.#children, insertion, r)
        this.layout.mapRegister(id, save)
        return this
    }
}
