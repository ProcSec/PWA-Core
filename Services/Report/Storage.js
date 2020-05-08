import DBTool from "@Core/Tools/db/DBTool"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import { Report } from "."

export default class ReportStorage {
    static #connection = null

    static logObjectStorageName = "log"

    static lsItemName = "report-fallback-log"

    static async DBConnection() {
        const self = this

        if (!this.#connection) {
            this.#connection = new DBTool("ReportData", 1, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion === 0) {
                        db.createObjectStore(self.logObjectStorageName, {
                            keyPath: "key",
                            autoIncrement: true,
                        })
                    }
                },
            })
        }

        return this.#connection.onReady()
    }

    static #dbOS

    static async DBOS() {
        if (this.#dbOS) return this.#dbOS
        const db = await this.DBConnection()
        this.#dbOS = db.OSTool(this.logObjectStorageName)
        return this.#dbOS
    }

    static async save(report, { recursionStack = 0 } = {}) {
        if (this.loggingLevel === null || report.level < this.loggingLevel || !report.db) return
        let data = false
        let useFallback = true
        if (!report.dbEnforceFallback) {
            try {
                const log = this.transformSpecial(report.log, report)
                data = {
                    tags: report.original.tags.map((e) => e.name).filter((e) => e !== "default"),
                    log,
                    time: Date.now(),
                    session: report.original.session.id,
                }

                const os = await this.DBOS()

                await os.add(
                    data,
                )
                useFallback = false
            } catch (e) {
                Report.add(e, ["report.storage.error"], { recursionStack: ++recursionStack })
            }
        }
        if (useFallback) {
            this.fallbackSave(data || { log: report.log }, report)
        }
    }

    static transformSpecial(object, report = false) {
        return JSON.parse(JSON.stringify(object, (k, value) => {
            this.#hooks.forEach((hook) => {
                try {
                    value = hook.hook(k, value)
                } catch (e) {
                    Report.add([hook.name, e], ["report.storage.hookError"], { recursionStack: (report ? ++report.original.recursionStack : 1) })
                }
            })
            return value
        }))
    }

    static async fallbackSave(object, report) {
        try {
            object = this.transformSpecial(object, report)
        } catch (e) {
            // Ignore error
        }

        let str = ""
        const cur = localStorage.getItem(this.lsItemName)
        const n = JSON.stringify(JSON.stringify(object))
        str += (cur === null ? "" : `${cur},`) + n

        localStorage.setItem(this.lsItemName, str)
    }

    static #hooks = []

    static addTransformHook(func, name) {
        if (typeof func !== "function") throw new TypeError("Function expected")
        if (typeof name !== "string") throw new TypeError("String name expected")
        this.#hooks.push({ hook: func, name })
    }

    static async export({ currentOnly = false } = {}) {
        let dbNotice = false
        let dbData = []
        try {
            const os = await this.DBOS()
            dbData = Array.from((currentOnly
                ? await os.getWhere(
                    await os.createCursor(null, "prev", "read"),
                    ((i) => i.session === Report.session.id),
                )
                : await os.getAll()))
        } catch (e) {
            dbNotice = e
        }
        const ls = JSON.parse(`[${localStorage.getItem(this.lsItemName) || ""}]`)
            .map((e) => Object.assign(JSON.parse(e), { fallback: true }))
        return [
            ...(dbNotice ? [
                { "[[SPECIAL]]": "notice", message: "IndexedDB request failed", data: errorToObject(dbNotice) },
            ] : []),
            ...dbData,
            ...ls,
        ]
    }

    static loggingLevel = -1
}
