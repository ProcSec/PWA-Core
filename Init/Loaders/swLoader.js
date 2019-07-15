import { CoreLoader, CoreLoaderResult, CoreLoaderWarning } from "@Core/Init/CoreLoader"
import SW from "@Core/Services/SW"

CoreLoader.registerTask({
    id: "sw-register",
    presence: "Service Worker registration",
    task() {
        const res = SW.register()
        if (res) return new CoreLoaderResult()
        return new CoreLoaderWarning("Navigator does not support Service Workers")
    },
    alwaysResolve: true,
})
