export default function errorToObject(e) {
    function parseError(value) {
        const error = { "[[SPECIAL]]": "error" }

        Object.getOwnPropertyNames(value).forEach((key) => {
            error[key] = value[key]
        })
        return error
    }

    function replaceErrors(jk, value) {
        if (value instanceof Error) {
            return parseError(value)
        }
        if (value instanceof ErrorEvent) {
            return parseError(value.error)
        }

        return value
    }

    return JSON.parse(JSON.stringify(e, replaceErrors))
}
