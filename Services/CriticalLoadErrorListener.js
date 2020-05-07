import SplashScreenController from "@Environment/Loaders/SplashScreenController"
import LoadState from "./LoadState"

function escapeHTML(unsafeText) {
    const div = document.createElement("div")
    div.innerText = unsafeText
    return div.innerHTML
}

export default class CriticalLoadErrorListener {
    static #listener = (...data) => {
        if (typeof this.#customListener === "function") {
            try {
                this.#customListener(...data)
            } catch (e) {
                console.error(e)
                this.#defaultListener(...data)

                let error
                if (typeof e === "object") {
                    const filename = e.fileName || e.filename || "[unknown file]"
                    const lineno = e.lineNumber || e.lineno || "?"
                    const colno = e.columnNumber || e.colno || "??"
                    const stack = e.stack || false

                    error = (e.message ? `${e.message} on ${filename}:${lineno}:${colno} \n${stack}` : "No debug info available")
                } else error = String(e)

                document.body.insertAdjacentHTML("beforeend",
                    `<br><br><p><b>Also faced an error while displaying error message:</b></p> <pre>${escapeHTML(error)}</pre>`)
            }
        } else {
            this.#defaultListener(...data)
        }
    }

    static #defaultListener = (e, consoleIt = true) => {
        if (consoleIt) console.error(e)

        try {
            SplashScreenController.splashElement.remove()
        } catch (er) {
            // Handle error
        }

        let error
        if (typeof e === "object") {
            const filename = e.fileName || e.filename || "[unknown file]"
            const lineno = e.lineNumber || e.lineno || "?"
            const colno = e.columnNumber || e.colno || "??"
            const stack = e.stack || false

            error = (e.message ? `${e.message} on ${filename}:${lineno}:${colno} \n${stack}` : "No debug info available")
        } else error = String(e)
        const ua = window.navigator.userAgent

        document.body.innerHTML = `
<h1 style="color: red;">Fatal Error</h1>
<p><i>Failed to initiate the app</i></p>
<pre style="max-width: 100vw; overflow: auto; user-select: all;">${escapeHTML(error)}
${escapeHTML(ua)}</pre>`
    }

    static #customListener = false

    static get listener() {
        return this.#listener
    }

    static set listener(s) {
        if (typeof s !== "function") throw TypeError("Function was expected as an error handler")
        this.#customListener = s
        return s
    }
}

window.addEventListener("error", (e) => {
    if (LoadState.is === true) return

    if (!document.body) window.addEventListener("load", () => CriticalLoadErrorListener.listener(e))
    else CriticalLoadErrorListener.listener(e)
})

window.addEventListener("unhandledrejection", (e) => {
    if (LoadState.is === true) return

    if (!document.body) window.addEventListener("load", () => CriticalLoadErrorListener.listener(e.reason))
    else CriticalLoadErrorListener.listener(e.reason)
})
