import DBTool from "@Core/Tools/db/DBTool"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import { OutputRecovery } from "@App/debug/recovery"
import App from "./app"

export default class Report {
    static StorageName = "console-output"

    static _dbConnectionInstance = null

    static async DBConnection() {
        const self = this

        if (!this._dbConnectionInstance) {
            this._dbConnectionInstance = new DBTool("LogData", 1, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion === 0) {
                        db.createObjectStore(self.StorageName, {
                            keyPath: "key",
                            autoIncrement: true,
                        })
                    }
                },
            })
        }

        return this._dbConnectionInstance.onReady()
    }

    static async DBOS() {
        if (this._dbOS) return this._dbOS
        const db = await this.DBConnection()
        this._dbOS = db.OSTool(this.StorageName)
        return this._dbOS
    }


    static trace() {
        let stack = new Error().stack || ""
        stack = stack.split("\n").map(line => line.trim())
        return stack.splice(stack[0] === "Error" ? 2 : 1)
    }

    static write(...log) {
        const lines = this.trace()
        this.writeNoTrace(...log)
        OutputRecovery(lines)
        if (App.debug) {
            console.groupCollapsed("Trace")
            lines.forEach((line) => {
                console.log(line)
            })
            console.groupEnd()
        }
    }

    static writeNoTrace(...log) {
        OutputRecovery(...log)
        this.saveToDB(
            ...log.map(re => (re instanceof Error ? errorToObject(re) : re)),
        )
        if (App.debug) {
            console.log(...log)
        }
    }

    static warn(...log) {
        OutputRecovery(...log)
        this.saveToDB(
            ...log.map(re => (re instanceof Error ? errorToObject(re) : re)),
        )
        console.warn(...log)
    }

    static error(...log) {
        OutputRecovery(...log)
        this.saveToDB(
            ...log.map(re => (re instanceof Error ? errorToObject(re) : re)),
        )
        console.error(...log)
    }

    static async saveToDB(...log) {
        try {
            log = log.map((e) => {
                const s = JSON.stringify(e)
                return (s !== undefined ? JSON.parse(s) : undefined)
            })
            if (log.length === 1) [log] = log
            const os = await this.DBOS()
            const r = os.add({ log })
            return r
        } catch (e) {
            console.log("Failed DB log", e, log)
            return false
        }
    }

    static async allLog() {
        const os = await this.DBOS()
        const r = await os.getAll()
        return r
    }
}
