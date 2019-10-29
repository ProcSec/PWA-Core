import LoadState from "./LoadState"


export default class CriticalLoadErrorListener {
    static _listener = (e, consoleIt = true) => {
        function escapeHTML(unsafeText) {
            const div = document.createElement("div")
            div.innerText = unsafeText
            return div.innerHTML
        }

        if (consoleIt) console.error(e)

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

    static get listener() {
        return this._listener
    }

    static set listener(s) {
        if (typeof s !== "function") throw TypeError("Function was expected as an error handler")
        this._listener = s
        return s
    }
}

window.addEventListener("error", (e) => {
    if (LoadState.is === true) return

    if (!document.body) window.addEventListener("load", () => CriticalLoadErrorListener.listener(e))
    else CriticalLoadErrorListener.listener(e)
})
