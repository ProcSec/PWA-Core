import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import ucFirst from "@Core/Tools/transformation/text/ucFirst"
import Report from "../reportOld"
import LanguageCore from "./core"

const languagePack = LanguageCore.language

let { strings, library } = languagePack

function fallback(string) {
    try {
        string = string.toString()
        if ("fallbackString" in library
            && typeof library.fallbackString === "function") return library.fallbackString(string)
    } catch (e) {
        // Fallback to recovery
    }

    return `[${string}]`
}

function callLibrary(name, data, p, string) {
    if (!(name in library)
        || typeof library[name] !== "function") throw new Error("No such function in library")

    return library[name](data, p, string)
}

function $(string, p = undefined, useFallback = true) {
    try {
        if (strings === undefined) {
            const loaded = LanguageCore.language;
            ({ strings, library } = loaded)
        }

        if (typeof string !== "string") throw new TypeError("Localization key is string only")

        let data = strings[string]

        if (string.match(/^[a-zA-Z0-9_/]+[^/]$/)) {
            const groups = string.split("/")
            data = strings
            string = groups[groups.length - 1]
            while (groups.length && data !== undefined) {
                data = data[groups.shift()]
            }
        }

        if (typeof data === "string") return data

        if (data === undefined) throw new Error(`Such string (${string}) does not exist`)

        if (typeof data !== "object") throw new Error("Incorrect string")
        if ("" in data && typeof data[""] === "string") return data[""]
        if (!("type" in data)) throw new Error("Incorrect string")

        if (data.type === "func") {
            new FieldsContainer([
                ["type", "name", "data"],
                {
                    type: new FieldChecker({ type: "string" }),
                    name: new FieldChecker({ type: "string" }),
                },
            ]).set(data)

            return callLibrary(data.name, data.data, p, string)
        }
        if (data.type === "funcs") {
            new FieldsContainer([
                ["type", "name", "data"],
                {
                    type: new FieldChecker({ type: "string" }),
                    name: new FieldsContainer("array", new FieldChecker({ type: "string" })),
                },
            ]).set(data)

            let res = data.data

            data.name.forEach((e) => {
                res = callLibrary(data.name, res, p, string)
            })

            return res
        }

        throw new Error("Unsupported Smart-String")
    } catch (e) {
        if (useFallback) {
            Report.write("Language string error", e)
            return fallback(string)
        }
        throw e
    }
}

function $$(...a) {
    return ucFirst($(...a))
}

export {
    $,
    $$,
}
