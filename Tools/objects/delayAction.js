export default function delayAction(func) {
    return window.requestIdleCallback(func)
}
