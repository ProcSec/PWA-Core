import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import { Nav } from "@Environment/Library/DOM/buildBlock"
import { Report, ReportSession } from "./Report"


window.history.replaceState({ pointer: 0, session: ReportSession.id }, "")

export default class Navigation {
    static prefix = "/"

    static paramsDelimeter = "/+/"

    static fallbackSplitter = "/"

    static resetTitle = false

    static titleFallback = "App"

    static modulesRegister = []

    static get url() {
        const url = window.location.pathname

        if (typeof this.prefix === "string"
            && this.prefix !== "") {
            if (url.indexOf(this.prefix) !== 0) return ({ error: 2, info: "Incorrect prefix" })
        }
        return url.slice(this.prefix.length)
    }

    static set url(url) {
        if (typeof url === "object") {
            new FieldsContainer([
                ["module"],
                {
                    module: new FieldChecker({ type: "string" }),
                    params: new FieldChecker({ type: "object" }),
                    title: new FieldChecker({ type: "string" }),
                },
            ]).set(url)
            url.params = url.params || {}
            const stringURL = `${this.prefix}${url.module}${(Object.keys(url.params).length > 0 ? `${this.paramsDelimeter}${this.paramsGenerator(url.params)}` : "")}`

            if (url.title || this.resetTitle) this.updateTitle(url.title || this.titleFallback)
            this.url = stringURL

            return stringURL
        }
        window.history.pushState({ pointer: ++this.pointer, session: ReportSession.id }, "", url)
        this.listener()
        return this.parseURL(url)
    }

    static reload() {
        // eslint-disable-next-line no-self-assign
        this.url = this.url
    }

    static history = []

    static historyCurrent = [Object.create(null)]

    static historyFuture = []

    static historyCurrentFuture = []

    static pointer = 0

    static get Current() {
        return this.historyCurrent[this.historyCurrent.length - 1]
    }

    static set Current(set) {
        if (typeof set !== "object") throw new Error("Incorrect Current set")

        this.historyCurrent[this.historyCurrent.length - 1] = set
    }

    static updateTitle(title) {
        window.document.title = String(title)
    }

    static paramsParser(params = "") {
        params = params.toString()
        if (params === "") return []
        try {
            return JSON.parse(`{"${params.replace(/&/g, "\",\"").replace(/=/g, "\":\"")}"}`,
                (key, value) => (key === "" ? value : decodeURIComponent(value)))
        } catch (e) {
            return params.split(this.fallbackSplitter).map((el) => decodeURIComponent(el))
        }
    }

    static paramsGenerator(params = {}) {
        if (typeof params !== "object") return ""

        if (Array.isArray(params)) {
            return params.map((e) => encodeURIComponent(e)).join(this.fallbackSplitter)
        }
        return Object.entries(params).map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val.toString())}`).join("&")
    }

    static addModule(config) {
        new FieldsContainer([
            ["name", "id", "callback"],
            {
                name: new FieldChecker({ type: "string" }),
                id: new FieldChecker({ type: "string", symbols: "a-z_" }),
                callback: new FieldChecker({ type: "function" }),
            },
        ]).set(config)

        this.modulesRegister.push(config)
    }

    static get parse() {
        return this.parseURL()
    }

    static parseURL(url = this.url) {
        let module = ""
        let paramsString = ""
        let params = []

        url = url.toString()
        // Is Empty
        if (url === "") return ({ error: 1, info: "URL is empty" })

        // Params splitter
        const paramsDelimeter = url.indexOf(this.paramsDelimeter)
        if (paramsDelimeter !== -1) {
            module = decodeURIComponent(url.slice(0, paramsDelimeter))
            paramsString = url.slice(paramsDelimeter + this.paramsDelimeter.length)
            params = this.paramsParser(paramsString)
        } else {
            module = decodeURIComponent(url)
        }

        url = decodeURIComponent(url)

        const r = {
            module,
            params,
            url,
        }

        return (r)
    }

    parsedCallback(nav) {
        // Callback and Nav
        const listeners = this.modulesRegister.filter((e) => e.name === module)
        listeners.forEach((e) => {
            e.callback(nav)
            if (e.id !== "") Nav.highlight(e, nav)
        })
    }

    static get whatHappened() {
        if (this.history.length === 0) this.history.push(this.url)

        if (window.history.state.session !== ReportSession.id) return "change"
        if (window.history.state.pointer === this.pointer) return "change"
        if (window.history.state.pointer > this.pointer) return "forward"
        if (window.history.state.pointer < this.pointer) return "back"
        return "change"
    }

    static listener(manual) {
        const event = manual || this.whatHappened
        this.pointer = window.history.state.pointer

        const parsed = this.parse

        const { url } = this

        if ((typeof parsed === "object" && "error" in parsed)
            || (typeof url === "object" && "error" in url)) throw Error(parsed.info)

        if (event === "change") {
            this.history.push(url)
            this.historyCurrent.push(Object.create(null))
            Report.add(parsed, ["nav.change"])
            const navigationEvent = new CustomEvent("appNavigation", { cancelable: true, detail: { type: "change", parsed } })
            window.dispatchEvent(navigationEvent)
            if (navigationEvent.defaultPrevented) return null
            return this.go(parsed.module, parsed.params, manual)
        }

        if (event === "back") {
            this.historyFuture.push(this.history.pop())
            this.historyCurrentFuture.push(this.historyCurrent.pop())
            Report.add(parsed, ["nav.back"])
            const navigationEvent = new CustomEvent("appNavigation", { cancelable: true, detail: { type: "back", parsed } })
            window.dispatchEvent(navigationEvent)
            if (navigationEvent.defaultPrevented) return null
            return this.go(parsed.module, parsed.params)
        }

        if (event === "forward") {
            this.history.push(this.historyFuture.pop())
            this.historyCurrent.push(this.historyCurrentFuture.pop())
            Report.add(parsed, ["nav.forward"])
            const navigationEvent = new CustomEvent("appNavigation", { cancelable: true, detail: { type: "forward", parsed } })
            window.dispatchEvent(navigationEvent)
            if (navigationEvent.defaultPrevented) return null
            return this.go(parsed.module, parsed.params)
        }

        return false
    }

    static go(module, params, manual) {
        const callbacks = this.modulesRegister.filter((e) => e.id === module)

        if (!(callbacks.length > 0)) {
            if (manual !== undefined) this.InitNavigationError()
            return false
        }
        callbacks.forEach((e) => {
            if ("callback" in e && typeof e.callback === "function") e.callback(module, params)
        })
        return true
    }

    static InitErrorHandler() {
        /*
                this.url = {
                    module: "name",
                    params: {},
                } or call page rendering
                */
    }

    static defaultScreenHandler() {
        /*
                this.url = {
                    module: "name",
                    params: {},
                } or call page rendering
                */
    }

    static get InitNavigationError() {
        return this.InitErrorHandler
    }

    static get defaultScreen() {
        return this.defaultScreenHandler
    }

    static set InitNavigationError(s) {
        this.InitErrorHandler = s
    }

    static set defaultScreen(s) {
        this.defaultScreenHandler = s
    }
}
