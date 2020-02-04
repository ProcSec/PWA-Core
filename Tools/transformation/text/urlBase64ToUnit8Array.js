export default function urlBase64ToUint8Array(base64String) {
    const p = "=".repeat((4 - (base64String.length % 4)) % 4)
    const b = (base64String + p)
        .replace(/-/g, "+")
        .replace(/_/g, "/")

    const r = window.atob(b)
    const res = new Uint8Array(r.length)

    for (let i = 0; i < r.length; ++i) {
        res[i] = r.charCodeAt(i)
    }
    return res
}
