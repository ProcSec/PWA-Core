export default function size(value) {
    let s = 0
    s += JSON.stringify(value).length
    if (typeof value === "string") s -= 2

    if (typeof value === "object") {
        Object.keys(value).forEach((e) => {
            if (e in value
                && value[e] instanceof Blob) {
                s += value[e].size
            }
        })
    }

    return s
}
