import hashCode from "@Core/Tools/transformation/text/hashCode"
import { $ } from "@Core/Services/Language/handler"
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"

export default class NotificationChannelDescriptor {
    constructor({
        type, id,
        icon = "notifications",
        sign = { mode: "local", value: "@push/i/std/sign" },
        description = { mode: "local", value: "@push/i/std/description" },
    }) {
        new FieldsContainer([
            ["type", "id", "icon", "sign", "description"],
            {
                type: new FieldChecker({ type: "string" }),
                id: new FieldChecker({ type: "string" }),
                icon: new FieldChecker({ type: "string" }),
                sign: new FieldsContainer([
                    ["mode", "value"],
                    {
                        mode: new FieldChecker({ type: "string" }),
                        value: new FieldChecker({ type: "string" }),
                    },
                ]),
                description: new FieldsContainer([
                    ["mode", "value"],
                    {
                        mode: new FieldChecker({ type: "string" }),
                        value: new FieldChecker({ type: "string" }),
                    },
                ]),
            },
        ]).set({
            type, id, icon, sign, description,
        })

        this.type = type
        this.id = id
        this.icon = icon
        this.signRaw = sign
        this.descriptionRaw = description
    }

    get hash() {
        return hashCode(JSON.stringify({ type: this.type, id: this.id }))
    }

    sign() {
        return this.constructor.templateWorker(this.signRaw)
    }

    description() {
        return this.constructor.templateWorker(this.descriptionRaw)
    }

    static async templateWorker({ mode, value }) {
        if (mode === "text") return value
        if (mode === "local") return $(...(Array.isArray(value) ? value : [value]))
        return `[${value}]`
    }
}
