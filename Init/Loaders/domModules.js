import domIncludesLoader from "@DOMPath/DOM/Helpers/domIncludesLoader"
import { CoreLoader, CoreLoaderResult } from "@Core/Init/CoreLoader"
import DOMController from "@DOMPath/DOM/Helpers/domController"

CoreLoader.registerTask({
    id: "dom-modules",
    presence: "DOM Modules",
    async task() {
        await domIncludesLoader()
        return new CoreLoaderResult(
            true,
            {
                DOMControllerReport: {
                    modules: DOMController.getModules(),
                    properties: DOMController.getProperties(),
                    modificators: DOMController.getModificators(),
                },
            },
        )
    },
})
