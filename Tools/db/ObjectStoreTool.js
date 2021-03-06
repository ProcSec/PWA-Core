import size from "../objects/size"

export default class ObjectStoreTool {
    connection = null

    name = null

    constructor(connection, name) {
        if (typeof name !== "string") throw new TypeError("Incorrect ObjectStore name")
        if (!connection.isReady) throw new Error("Connection subject must be ready")

        this.connection = connection
        this.name = name

        return new Proxy(this, {
            get(target, propKey) {
                if (!(propKey in target)) {
                    const os = target.getOS(true)
                    const r = os[propKey]
                    if (typeof r === "function") return r.bind(os)
                    return r
                }
                return target[propKey]
            },
        })
    }

    get parent() {
        return this.connection
    }

    get name() {
        return this.name
    }

    async create(params = {}) {
        await this.connection.onReady()
        return this.connection.DBConnection.createObjectStore(this.name, params)
    }

    async destroy(params = {}) {
        await this.connection.onReady()
        return this.connection.DBConnection.deleteObjectStore(this.name, params)
    }

    async getAll() {
        const os = this.getOS()
        if ("getAll" in os) return os.getAll()

        return this.getByCount()
    }

    getOS(type = false) {
        return this.connection.getObjectStore(this.name, type)
    }

    async getSize() {
        const self = this
        self.size = 0
        return new Promise((resolve, reject) => {
            this.getOS()
                .openCursor()
                .then(
                    function iter(cursor) {
                        if (!cursor) return resolve(self.size)
                        self.size += size(cursor.value)

                        return cursor.continue().then(iter)
                    },
                )
        })
    }

    static generateIDBRange(params) {
        try {
            if (params instanceof IDBKeyRange) return params
            if (Array.isArray(params)) {
                if (params.length === 0) return null
                if (params.length === 1) {
                    if (Array.isArray(params[0])) return IDBKeyRange.lowerBound(params[0][0])
                    return IDBKeyRange.lowerBound(params[0], true)
                }
                if (params.length === 2) {
                    if (params[0] === null) {
                        if (Array.isArray(params[1])) {
                            return IDBKeyRange.upperBound(params[1][0])
                        }
                        return IDBKeyRange.upperBound(params[0], true)
                    }
                    let first = params[0]
                    let second = params[1]
                    let firstStrict = true
                    let secondStrict = true

                    if (Array.isArray(first)) {
                        [first] = first
                        firstStrict = false
                    }

                    if (Array.isArray(second)) {
                        [second] = second
                        secondStrict = false
                    }

                    return IDBKeyRange.bound(first, second, firstStrict, secondStrict)
                }
            }
        } catch (e) {
            return null
        }

        return null
    }

    async createCursor(range = null, direction = "next", type = false) {
        return this.getOS(type)
            .openCursor(this.constructor.generateIDBRange(range), direction)
    }

    async getWhere(cursorInstance = null, ...conditions) {
        cursorInstance = cursorInstance || await this.createCursor()
        return new Promise((resolve, reject) => {
            const result = []

            function iter(cursor) {
                if (!cursor) return resolve(result)
                if (conditions.every((func) => func(cursor.value))) result.push(cursor.value)

                return cursor.continue().then(iter)
            }
            iter(cursorInstance)
        })
    }

    getWhereOr(cursorInstance = null, ...conditions) {
        return this.getWhere(cursorInstance, (value) => conditions.some((func) => func(value)))
    }

    getWhereCombine(cursorInstance = null, and = [], or = []) {
        return this.getWhere(cursorInstance, (value) => {
            let a = true
            let o = true
            if (and.length > 0) a = and.every((func) => func(value))
            if (or.length > 0 && a) o = or.some((func) => func(value))
            return a && o
        })
    }

    async getByCount(count = -1, direction = "next", range = null) {
        const cur = await this.createCursor(
            range,
            direction,
        )

        let i = 0
        const r = []

        return new Promise(async (resolve) => {
            async function iter(cursor) {
                if (!cursor || (count !== -1 && i >= count)) return resolve(r)
                i++
                r.push(cursor.value)
                cursor = await cursor.continue()
                iter(cursor)
                return undefined
            }
            iter(cur)
        })
    }

    async clearPercent(percent = 1, direction = "next", range = null) {
        if (typeof percent !== "number" || percent > 1 || percent < 0) return false
        if (percent === 1 && range === null) return this.clear()
        let allSize = 0
        const thisAllSize = await this.getSize()
        return new Promise(async (resolve) => {
            const os = this
            const cur = await os.createCursor(range, direction, true)
            function iter(cursor) {
                if (!cursor || (allSize / thisAllSize) > percent) return resolve(allSize)

                allSize += size(cursor.value)
                cursor.delete()
                return cursor.continue().then(iter)
            }
            iter(cur)
        })
    }
}
