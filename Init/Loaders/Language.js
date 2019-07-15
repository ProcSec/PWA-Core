import LanguageCore from "@Core/Services/Language/core"
import { CoreLoader, CoreLoaderResult } from "@Core/Init/CoreLoader"

CoreLoader.registerTask({
    id: "language-autoload",
    presence: "Autoload language",
    async task() {
        const l = await LanguageCore.autoLoad()
        return new CoreLoaderResult(true, l)
    },
})
