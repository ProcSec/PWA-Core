import FieldChecker from "@Core/Tools/validation/fieldChecker"
import randomString from "@Core/Tools/objects/randomString"
import CoreLoaderWarning from "./CoreLoaderWarning"
import CoreLoaderThrowable from "./CoreLoaderThrowable"
import CoreLoaderError from "./CoreLoaderError"
import CoreLoaderResult from "./CoreLoaderResult"
import CoreLoaderSkip from "./CoreLoaderSkip"


class CoreLoader {
    static _syncQueue = []

    static _syncRunning = false

    static _reg = new Map()

    static _doneListeners = new Set()

    static _sessionId = `${Math.floor(Date.now() / 8640000).toString(36)}/${randomString(9)}`

    static get sessionID() {
        return this._sessionId
    }

    _loadSuccessCache = true

    static registerTask({
        id, presence, task, async = false, alwaysResolve = false,
    }) {
        new FieldChecker({ type: "string" }).set(id)
        new FieldChecker({ type: "string" }).set(presence)
        new FieldChecker({ type: "function" }).set(task)
        new FieldChecker({ type: "boolean" }).set(async)
        new FieldChecker({ type: "boolean" }).set(alwaysResolve)

        if (this._reg.has(id)) throw new TypeError(`ID '${id}' for CoreLoader task is already set`)
        const taskData = {
            id, presence, task, async, alwaysResolve,
        }

        this._reg.set(id, taskData)

        return this._runTask(id)
    }

    static taskInfo(id) {
        return this._itemToReport(this._getTask(id))
    }

    static getResult(id) {
        const task = this._getTask(id)
        if (!task || !("result" in task)) return false
        return task.result
    }

    static get report() {
        return Array.from(this._reg.values()).map(this._itemToReport)
    }

    static addDoneListener(task) {
        this._doneListeners.add(task)
    }

    static removeDoneListener(task) {
        this._doneListeners.delete(task)
    }

    static _getTask(id) {
        return this._reg.get(id)
    }

    static async _runTask(id) {
        const task = this._getTask(id)
        let res

        try {
            if (task.async) res = await this._asyncRunner(task)
            else res = await this._queueRunnerRecursive(task)
        } catch (e) {
            res = e
        }

        this._emitTaskDone(id)

        return res
    }

    static async _asyncRunner(task) {
        let result
        let caught = false

        try {
            result = await this._taskWrapper(task)
        } catch (r) {
            caught = true
            result = r
        }

        task.result = result

        if (caught && !task.alwaysResolve) {
            if (result.state === 1) this._loadSuccessCache = false
            throw result
        }
        return result
    }

    static async _queueRunnerRecursive(task = null) {
        if (task !== null) {
            let promiseResolve; let
                promiseReject

            const promise = new Promise(((resolve, reject) => {
                promiseResolve = resolve
                promiseReject = reject
            }))

            this._syncQueue.push({
                task, promise, promiseResolve, promiseReject,
            })
            if (this._syncRunning) return promise
        }
        if (this._syncQueue.length === 0) {
            this._syncRunning = false
            return false
        }

        this._syncRunning = true
        const currentTask = this._syncQueue.shift()

        let result
        let caught = false
        try {
            result = await this._taskWrapper(currentTask.task)
        } catch (resultThrow) {
            result = resultThrow
            caught = true
        }

        currentTask.task.result = result

        if (!caught || currentTask.alwaysResolve) currentTask.promiseResolve(result)
        else {
            if (result.state === 1) this._loadSuccessCache = false
            currentTask.promiseReject(result)
        }

        this._queueRunnerRecursive()
        return true
    }

    static async _taskWrapper(taskData) {
        let state = 0
        let answer
        let data
        let type = 0

        if (this._loadSuccessCache === false) return false

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

        if (state === 2 && this._loadSuccessCache === 0) this._loadSuccessCache = 2
        else if (state === 1) this._loadSuccessCache = 1

        const ret = {
            state, answer, data, type,
        }

        if (state === 0) return ret
        throw ret
    }

    static _emitTaskDone(id) {
        try {
            this._doneListeners.forEach((el) => el(this.taskInfo(id)))
        } catch (e) {
            // No errors
        }
    }

    static _itemToReport(el) {
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
