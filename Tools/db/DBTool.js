import { openDB, deleteDB } from "idb"
import ObjectStoreTool from "./ObjectStoreTool"

export default class DBTool {
    DBName = null

    DBVersion = 0

    _DBConnection = null

    get DBConnection() {
        if (this._DBConnection === null) throw new Error("DB is not ready yet")
        return this._DBConnection
    }

    set DBConnection(s) {
        this._DBConnection = s
    }

    upgradeAgent = null

    size = Object.create(null)

    constructor(db, version,
        { upgrade = () => { }, blocked = () => { }, blocking = () => { } } = {}) {
        if (typeof db !== "string"
            || typeof version !== "number"
            || typeof upgrade !== "function"
            || typeof blocked !== "function"
            || typeof blocking !== "function") throw new Error("Incorrect DB params")

        this.DBName = db
        this.DBVersion = version
        this.upgradeAgent = upgrade
        this.blockedAgent = blocked
        this.blockingAgent = blocking

        let resolve
        let reject

        const waiter = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })

        this._openWaiter = waiter

        const self = this

        this.openDB().then(() => resolve(self)).catch(reject)
    }

    onReady() {
        if (this._DBConnection !== null) return Promise.resolve(this)

        return this._openWaiter
    }

    isReady = false

    delete() {
        return deleteDB(this.DBName)
    }

    getObjectStore(name, type = false) {
        return this.getTransaction(name, type).objectStore(name)
    }

    async getTablesList() {
        return [...this.DBConnection.objectStoreNames]
    }

    async getDBSize() {
        return Object.values(await this.getAllTablesSizes())
            .reduce((collector, i) => collector + i, 0)
    }

    getConnection() {
        if (this.DBConnection !== null) return Promise.resolve(this.DBConnection)

        return this.openDB()
    }

    async openDB() {
        const res = await openDB(this.DBName, this.DBVersion,
            {
                upgrade: this.upgradeAgent,
                blocked: this.blockedAgent,
                blocking: this.blockingAgent,
            })

        this.DBConnection = res
        this.isReady = true

        return res
    }

    getTransaction(name, type = false) {
        return this.DBConnection
            .transaction(name, (type ? "readwrite" : "readonly"))
    }

    async getAllTablesSizes() {
        const tables = await this.getTablesList()
        const sizes = await Promise.all(tables.map(r => new ObjectStoreTool(this, r).getSize()))

        const r = {}
        for (let i = 0; i < tables.length; i++) {
            r[tables[i]] = sizes[i]
        }
        return r
    }

    OSTool(name) {
        return new ObjectStoreTool(this, name)
    }
}
