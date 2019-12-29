/* global __PACKAGE_DOWNLOADABLE_LANG_PACKS */
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import LanguageCore from "./core"

export default class Language {
    library = false

    strings = false

    info = false

    constructor(code) {
        let l
        try {
            l = LanguageCore.languageList.find((e) => e.code === code)
            new FieldsContainer([
                ["code", "name", "dir", "author"],
                {
                    code: new FieldChecker({ type: "string", symbols: "a-z-" }),
                    name: new FieldChecker({ type: "string" }),
                    dir: new FieldChecker({ type: "string", symbols: "a-z-" }),
                    author: new FieldChecker({ type: "string", symbols: "a-zA-Zа-яА-Я._#@*-" }),
                },
            ]).set(l)
        } catch (e) {
            throw new Error("The language you specified does not supported or invalid")
        }

        this.info = l
    }

    async loadData() {
        try {
            const { strings, library } = (
                __PACKAGE_DOWNLOADABLE_LANG_PACKS
                    ? await import(`@Resources/language/${this.info.dir}`)
                    : require(`@Resources/language/${this.info.dir}`))
            new FieldsContainer([
                ["strings", "library"],
                {
                    strings: new FieldChecker({ type: "object" }),
                    library: new FieldChecker({ type: "function" }),
                },
            ]).set({ strings, library })

            this.strings = strings
            this.library = library
        } catch (e) {
            throw new Error("Invalid language package")
        }

        return true
    }
}
