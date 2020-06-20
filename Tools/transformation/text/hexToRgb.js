export default function hexToRgb(hex, { array = false } = {}) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!r) return null
    const res = {
        r: parseInt(r[1], 16),
        g: parseInt(r[2], 16),
        b: parseInt(r[3], 16),
    }
    if (!array) return res
    return [res.r, res.g, res.b]
}
