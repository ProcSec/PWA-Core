import { openDB, deleteDB } from "idb"
import ObjectStoreTool from "./ObjectStoreTool"

export default class DBTool {
    DBName = null

    DBVersion = 0

    DBConnection = null

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
    }

    delete() {
        return deleteDB(this.DBName)
    }

    async getObjectStore(name, type = false) {
        return (await this.getTransaction(name, type)).objectStore(name)
    }

    async getTablesList() {
        return [...(await this.getConnection()).objectStoreNames]
    }

    async getDBSize() {
        return Object.values(await this.getAllTablesSizes())
            .reduce((collector, i) => collector + i, 0)
    }

    async getConnection() {
        if (this.DBConnection !== null) return this.DBConnection

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
        return res
    }

    async getTransaction(name, type = false) {
        return (await this.getConnection())
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
