import LoadState from "./LoadState"


export default class CriticalLoadErrorListener {
    static _listener = (e) => {
        function escapeHTML(unsafeText) {
            const div = document.createElement("div")
            div.innerText = unsafeText
            return div.innerHTML
        }

        console.error(e)

        const error = (e.message ? `${e.message} on ${e.filename}:${e.lineno}:${e.colno}` : "No debug info available")
        const ua = window.navigator.userAgent

        document.body.innerHTML = `
<h1 style="color: red;">Fatal Error</h1>
<p><i>Failed to initiate the app</i></p>
<pre>${escapeHTML(error)}
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
