export default function errorToObject(e) {
    function parseError(value) {
        const error = { "[[SPECIAL]]": "error" }

        Object.getOwnPropertyNames(value).forEach((key) => {
            error[key] = value[key]
        })

        if ((value.fileName || value.filename)
            && (!("filename" in error) || !("fileName" in error))
        ) error.filename = value.fileName || value.filename

        if ((value.lineNumber || value.lineno)
            && (!("lineno" in error) || !("lineNumber" in error))
        ) error.lineno = value.lineNumber || value.lineno

        if ((value.columnNumber || value.colno)
            && (!("colno" in error) || !("columnNumber" in error))
        ) error.colno = value.columnNumber || value.colno

        if ((value.stack)
            && (!("stack" in error))
        ) error.stack = value.stack

        if ((value.message)
            && (!("message" in error))
        ) error.message = value.message

        return error
    }

    function replaceErrors(jk, value) {
        if (value instanceof Error) {
            return parseError(value)
        }
        if (value instanceof ErrorEvent) {
            return parseError(value.error || value.reason)
        }
        if (value instanceof PromiseRejectionEvent) {
            return parseError(value.error || value.reason)
        }

        return value
    }

    return JSON.parse(JSON.stringify(e, replaceErrors))
}
