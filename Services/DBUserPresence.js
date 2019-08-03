import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"

export default class DBUserPresence {
    static _register = []

    static registerNewPresence(data) {
        new FieldsContainer([
            ["id", "name", "description", "config", "actions", "functions"],
            {
                id: new FieldChecker({ type: "string", symbols: "a-zA-Z_" }),
                name: new FieldChecker({ tyle: "string" }),
                description: new FieldChecker({ type: "string" }),
                icon: new FieldChecker({ type: "string", symbold: "a-z_" }),
                quota: new FieldChecker({ type: "function" }),
                size: new FieldChecker({ type: "function" }),
                config: new FieldsContainer([
                    ["changeable", "display"],
                    {
                        changeable: new FieldChecker({ type: "boolean" }),
                        display: new FieldChecker({ type: "boolean" }),
                        min: new FieldChecker({ type: "number", checker: [q => q >= 0] }),
                        max: new FieldChecker({ type: "number", checker: [q => q >= 0] }),
                    },
                ]),
                actions: new FieldsContainer([
                    "array",
                    new FieldsContainer([
                        ["name"],
                        {
                            name: new FieldChecker({ type: "string" }),
                            handler: new FieldChecker({ type: "function" }),
                        },
                    ]),
                ]),
                functions: new FieldsContainer([
                    "array",
                    new FieldsContainer([
                        ["name"],
                        {
                            name: new FieldChecker({ type: "string", symbols: "a-z0-9-" }),
                            handler: new FieldChecker({ type: "function" }),
                        },
                    ]),
                ]),
            },
        ]).set(data)
        if ("config" in data && data.config.changeable === true) {
            if (!("min" in data.config)
                || !("max" in data.config)
                || data.config.max < data.config.min) throw new Error("Incorrect statement")
        }

        this._register.push(data);

        (async () => {
            if ("quota" in data && await data.size() > await data.quota()) {
                const autoClean = data.functions.find(e => e.name === "auto-clean")
                if (autoClean) autoClean.handler()
            }
        })()
    }

    static getAll() {
        return this._register
    }

    static get(id) {
        return this._register.find(e => e.id === id)
    }
}
