import { CoreLoader } from "@Core/Init/CoreLoader"
import LoadState from "@Core/Services/LoadState"

CoreLoader.registerTask({
    id: "init",
    presence: "Init Application",
    task() {
        if (process.env.NODE_ENV === "development") {
            require("@App/debug/testlab")
        }
        require("./UI")

        LoadState.is = true

        if (process.env.NODE_ENV === "development") {
            require("@App/debug/postlab")
        }
    },
})
