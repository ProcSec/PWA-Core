/* globals __PACKAGE_DOWNLOADABLE_LANG_PACKS */
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import ucFirst from "@Core/Tools/transformation/text/ucFirst"
import { Report } from "../Report"
import LanguageCore from "./core"
import Language from "./instance"

function fallback(string, p, full) {
    const languagePack = LanguageCore.language

    try {
        string = string.toString()
        if ("fallbackString" in languagePack.library
            && typeof languagePack.library.fallbackString === "function") return languagePack.library.fallbackString(string, p, full)
    } catch (e) {
        // Fallback to recovery
    }

    try {
        const query = String(full)
        if (!__PACKAGE_DOWNLOADABLE_LANG_PACKS
            && languagePack
            && languagePack.info
            && Array.isArray(languagePack.info.fallback)) {
            let fallbackCandidate = null

            languagePack.info.fallback.some((e) => {
                let fbLang = null

                try {
                    if (!(e in Language.loadedPacks)) {
                        fbLang = new Language(e)
                        fbLang.syncLoadData()
                    } else fbLang = Language.loadedPacks[e]

                    // eslint-disable-next-line no-use-before-define
                    fallbackCandidate = $(query, p, false, fbLang)
                    return true
                } catch {
                    return false
                }
            })

            if (fallbackCandidate !== null) return fallbackCandidate
        }
    } catch (e) {
        Report.add(e, "lang.stringError")
    }

    return `[${string}]`
}

function callLibrary(pack, name, data, p, string) {
    if (!(name in pack.library)
        || typeof pack.library[name] !== "function") throw new Error("No such function in library")

    return pack.library[name](data, p, string)
}

function $(string, p = undefined, useFallback = true, pack = LanguageCore.language) {
    const originalQuery = string
    try {
        if (typeof string !== "string") throw new TypeError("Localization key is string only")

        let data = pack.strings[string]

        if (string.match(/^[a-zA-Z0-9_/]+[^/]$/)) {
            const groups = string.split("/")
            data = pack.strings
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

            return callLibrary(pack, data.name, data.data, p, string)
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
                res = callLibrary(pack, data.name, res, p, string)
            })

            return res
        }

        throw new Error("Unsupported Smart-String")
    } catch (e) {
        if (useFallback) {
            Report.add(e, ["lang.stringError"])
            return fallback(string, p, originalQuery)
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
