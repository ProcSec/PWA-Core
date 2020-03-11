import { CoreLoader, CoreLoaderResult, CoreLoaderWarning } from "@Core/Init/CoreLoader"
import SW from "@Core/Services/SW"

CoreLoader.registerTask({
    id: "sw-register",
    presence: "Service Worker registration",
    async task() {
        try {
            await SW.register()
        } catch (e) {
            throw new CoreLoaderWarning("Registration failed", e)
        }

        return new CoreLoaderResult()
    },
    alwaysResolve: true,
})
