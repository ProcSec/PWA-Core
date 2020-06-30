import themesList from "@Generated/themes"
import { Report } from "./Report"

export default class Design {
    static theme = "default"

    static defaultTheme = "default"

    static presetDarkTheme = "dark"

    static themeObject = false

    static LSName = "ui_theme"

    static themesList = themesList

    static isAutomatic = false

    static getVar(name, value = false, float = false) {
        if (!value) return `var(--${name})`
        if (typeof name !== "string") throw new TypeError("CSS variables are set in strings only")

        let get = getComputedStyle(document.head).getPropertyValue(`--${name}`).trim()

        if (float) get = parseFloat(get)

        return get
    }

    static get scaffoldMode() {
        return this.getVar("flag-scaffold-mode", true)
    }

    static onScaffoldModeUpdate(f) {
        const MobileMediaQuery = window.matchMedia("(max-width: 500px)")
        MobileMediaQuery.addListener(f)
        return MobileMediaQuery
    }

    static async dafaultThemeHandler() {
        const loadDark = async () => {
            await this.themeLoader(this.presetDarkTheme, true)
            this.isAutomatic = true
        }

        const loadDefault = async () => {
            await this.themeLoader(this.defaultTheme, true)
            this.isAutomatic = true
        }

        const DarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const isDark = DarkMediaQuery.matches

        if (!this.isAutomatic) {
            DarkMediaQuery.addListener((ev) => {
                if (!this.isAutomatic) return
                if (ev.matches) loadDark()
                else loadDefault()
            })
        }

        this.isAutomatic = true

        return (isDark ? this.presetDarkTheme : this.defaultTheme)
    }

    static async themeLoader(name = null, auto = false) {
        let newTheme = false
        auto = auto || false

        // 1. Get requested theme name
        name = name || localStorage.getItem(this.LSName)
        if (name === null) {
            name = await this.dafaultThemeHandler()
            auto = true
        }

        // 2. Get theme object if not default
        if (name !== this.defaultTheme && name !== this.theme) {
            try {
                newTheme = await require(`@Themes/${name}/theme.css`)
            } catch (e) {
                Report.add(e, ["style.loadError"])
                throw new Error(1) // No such theme
            }
        }

        // 3. Disconnect current theme if present
        try {
            if (this.themeObject && name !== this.theme) {
                this.themeObject.unuse()
            }
        } catch (e) {
            throw new Error(2) // Failed disconnecting current theme
        }

        // 4. Connect new theme if needed
        try {
            if (newTheme) newTheme.use()
        } catch (e) {
            Report.add([e, newTheme], ["style.changeError"])
            throw new Error(3) // Failed connecting the theme
        }

        // 5. Update env colors
        try {
            const colorHead = this.getVar("color-main-bg", true)
            let metaItem = document.head.querySelector("[name=\"theme-color\"][content]")

            if (metaItem === null) {
                metaItem = document.createElement("meta")
                document.head.appendChild(metaItem)
            }

            metaItem.content = colorHead
        } catch (e) {
            // Failed to update the tag
        }

        // 6. Apply new settings
        if (newTheme) this.themeObject = newTheme
        this.theme = name
        if (!auto) localStorage.setItem(this.LSName, name)
        if (!auto) this.isAutomatic = false

        return this.themeObject
    }

    static hexToLuma(hex) { // > 160 - bright
        const rgb = this.hexToRgb(hex)
        const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
        return luma
    }

    static hexToRgb(hex) {
        const match = hex.match(RegExp("#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})", "i"))
        if (!match) return this.parseRgba(hex)
        const [r, g, b] = match
            .slice(1).map((n) => parseInt(n, 16))

        return [r, g, b]
    }

    static parseRgba(str) {
        return str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/).slice(1)
    }

    static get vh() {
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return h / 100
    }

    static get vw() {
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return w / 100
    }

    static get vmin() {
        return Math.min(this.vh, this.vw)
    }

    static get vmax() {
        return Math.max(this.vh, this.vw)
    }
}
