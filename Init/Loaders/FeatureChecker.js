import { CoreLoader, CoreLoaderError, CoreLoaderResult } from "@Core/Init/CoreLoader"

// IDB support check
CoreLoader.registerTask({
    id: "idb-support",
    presence: "IDB Support",
    task() {
        const db = window.indexedDB
            || window.mozIndexedDB
            || window.webkitIndexedDB
            || window.msIndexedDB

        if (!db) {
            throw new CoreLoaderError("No IndexedDB support in this browser")
        }
        return new CoreLoaderResult(true, db)
    },
})
