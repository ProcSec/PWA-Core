export default function delayAction(func) {
    return new Promise((resolve, reject) => {
        window.requestIdleCallback(async () => {
            try {
                resolve(await func())
            } catch (e) {
                reject(e)
            }
        })
    })
}
