import langList from "@Generated/languages"
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import SettingsStorage from "../Settings/SettingsStorage"
import Language from "./instance"

export default class LanguageCore {
    static _language = false

    static fallbackDefault = "en"

    static get languageList() {
        return langList
    }

    static get language() {
        return {
            strings: this._language.strings,
            library: this._language.library,
            info: this._language.info,
        }
    }

    static async defaultLang() {
        const ul = await SettingsStorage.get("user_ui_language")
        if (this.isSupported(ul)) return ul

        if (navigator.languages) {
            const lang = navigator.languages.find((e) => this.isSupported(e.slice(0, 2)))
            return (lang ? lang.slice(0, 2) : this.fallbackDefault)
        }
        if (navigator.language) {
            if (this.isSupported(navigator.language.slice(0, 2))) {
                return navigator.language.slice(0, 2)
            }
        }
        if (this.isSupported(this.fallbackDefault)) return this.fallbackDefault

        throw new Error("No languages to apply")
    }

    static isSupported(code) {
        return this.languageList.find((e) => e.code === code) !== undefined
    }

    static async autoLoad() {
        const l = await this.defaultLang()
        await this.applyLanguage(new Language(l))

        return l
    }

    static async applyLanguage(lang) {
        if (!(lang instanceof Language)) throw new TypeError("Incorrect Language instance passed")

        try {
            if (await lang.loadData() !== true) throw new Error("Failed loading the pack")
            new FieldsContainer([
                ["strings", "library", "info"],
                {
                    strings: new FieldChecker({ type: "object" }),
                    info: new FieldChecker({ type: "object" }),
                    library: new FieldChecker({ type: "function" }),
                },
            ]).set(lang)
        } catch (e) {
            throw new Error("Invalid language package or an error during loading")
        }

        this._language = lang
        document.documentElement.setAttribute("lang", lang.info.code)

        return true
    }
}
