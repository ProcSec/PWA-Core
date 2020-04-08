import DBTool from "@Core/Tools/db/DBTool"

export default class ReportStorage {
    static #connection = null

    static #logObjectStorageName = "log"

    static async DBConnection() {
        const self = this

        if (!this.#connection) {
            this.#connection = new DBTool("ReportData", 1, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    if (oldVersion === 0) {
                        db.createObjectStore(self.#logObjectStorageName, {
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
        this.#dbOS = db.OSTool(this.#logObjectStorageName)
        return this.#dbOS
    }

    static async save(...log) {
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

    static async fallbackSave(...log) {

    }
}
