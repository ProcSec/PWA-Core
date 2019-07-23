import LanguageCore from "@Core/Services/Language/core"
import { CoreLoader, CoreLoaderResult, CoreLoaderWarning } from "@Core/Init/CoreLoader"

CoreLoader.registerTask({
    id: "language-autoload",
    presence: "Autoload language",
    async task() {
        try {
            const l = await LanguageCore.autoLoad()
            return new CoreLoaderResult(true, l)
        } catch (e) {
            throw new CoreLoaderWarning(e.message)
        }
    },
})
