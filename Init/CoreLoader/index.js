import FieldChecker from "@Core/Tools/validation/fieldChecker"
import randomString from "@Core/Tools/objects/randomString"
import CoreLoaderWarning from "./CoreLoaderWarning"
import CoreLoaderThrowable from "./CoreLoaderThrowable"
import CoreLoaderError from "./CoreLoaderError"
import CoreLoaderResult from "./CoreLoaderResult"
import CoreLoaderSkip from "./CoreLoaderSkip"


class CoreLoader {
    static #syncQueue = []

    static #syncRunning = false

    static #reg = new Map()

    static #doneListeners = new Set()

    // TODO: Move sessionId
    static #sessionId = `${Math.floor(Date.now() / 8640000).toString(36)}/${randomString(9)}`

    static get sessionID() {
        return this.#sessionId
    }

    static #loadSuccessCache = true

    static registerTask({
        id, presence, task, async = false, alwaysResolve = false,
    }) {
        new FieldChecker({ type: "string" }).set(id)
        new FieldChecker({ type: "string" }).set(presence)
        new FieldChecker({ type: "function" }).set(task)
        new FieldChecker({ type: "boolean" }).set(async)
        new FieldChecker({ type: "boolean" }).set(alwaysResolve)

        if (this.#reg.has(id)) throw new TypeError(`ID '${id}' for CoreLoader task is already set`)
        const taskData = {
            id, presence, task, async, alwaysResolve,
        }

        this.#reg.set(id, taskData)

        return this.runTask(id)
    }

    static taskInfo(id) {
        return this.itemToReport(this.getTask(id))
    }

    static getResult(id) {
        const task = this.getTask(id)
        if (!task || !("result" in task)) return false
        return task.result
    }

    static get report() {
        return Array.from(this.#reg.values()).map(this.itemToReport)
    }

    static addDoneListener(task) {
        this.#doneListeners.add(task)
    }

    static removeDoneListener(task) {
        this.#doneListeners.delete(task)
    }

    static getTask(id) {
        return this.#reg.get(id)
    }

    static async runTask(id) {
        const task = this.getTask(id)
        let res

        try {
            if (task.async) res = await this.asyncRunner(task)
            else res = await this.queueRunnerRecursive(task)
        } catch (e) {
            res = e
        }

        this.emitTaskDone(id)

        return res
    }

    static async asyncRunner(task) {
        let result
        let caught = false

        try {
            result = await this.taskWrapper(task)
        } catch (r) {
            caught = true
            result = r
        }

        task.result = result

        if (caught && !task.alwaysResolve) {
            if (result.state === 1) this.#loadSuccessCache = false
            throw result
        }
        return result
    }

    static async queueRunnerRecursive(task = null) {
        if (task !== null) {
            let promiseResolve; let
                promiseReject

            const promise = new Promise(((resolve, reject) => {
                promiseResolve = resolve
                promiseReject = reject
            }))

            this.#syncQueue.push({
                task, promise, promiseResolve, promiseReject,
            })
            if (this.#syncRunning) return promise
        }
        if (this.#syncQueue.length === 0) {
            this.#syncRunning = false
            return false
        }

        this.#syncRunning = true
        const currentTask = this.#syncQueue.shift()

        let result
        let caught = false
        try {
            result = await this.taskWrapper(currentTask.task)
        } catch (resultThrow) {
            result = resultThrow
            caught = true
        }

        currentTask.task.result = result

        if (!caught || currentTask.alwaysResolve) currentTask.promiseResolve(result)
        else {
            if (result.state === 1) this.#loadSuccessCache = false
            currentTask.promiseReject(result)
        }

        this.queueRunnerRecursive()
        return true
    }

    static async taskWrapper(taskData) {
        let state = 0
        let answer
        let data
        let type = 0

        if (this.#loadSuccessCache === false) return false

        try {
            const res = await taskData.task()
            if (typeof res === "object" && !Array.isArray(res)) {
                ({ answer, data, type } = res)
            } else {
                answer = res
            }
        } catch (e) {
            type = 0
            if (e instanceof CoreLoaderWarning) state = 2
            else state = 1

            if (e instanceof CoreLoaderThrowable) {
                ({ explanation: answer, data } = e.info)
            } else if (e instanceof Error) {
                answer = e.message
                data = e
            }
        }

        if (state === 2 && this.#loadSuccessCache === 0) this.#loadSuccessCache = 2
        else if (state === 1) this.#loadSuccessCache = 1

        const ret = {
            state, answer, data, type,
        }

        if (state === 0) return ret
        throw ret
    }

    static emitTaskDone(id) {
        try {
            this.#doneListeners.forEach((el) => el(this.taskInfo(id)))
        } catch (e) {
            // No errors
        }
    }

    static itemToReport(el) {
        return {
            id: el.id,
            name: el.presence,
            result: ("result" in el ? el.result : null),
        }
    }
}

export {
    CoreLoader,
    CoreLoaderError,
    CoreLoaderResult,
    CoreLoaderSkip,
    CoreLoaderThrowable,
    CoreLoaderWarning,
}
