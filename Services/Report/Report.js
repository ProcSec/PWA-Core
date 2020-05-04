import delayAction from "@Core/Tools/objects/delayAction"
import ReportTags from "./Tags"
import ReportSession from "./Session"
import ReportTag from "./Tag"

export default class Report {
    constructor({
        log, tags, recursionStack, trace = [],
    }) {
        this.log = (Array.isArray(log) ? log : [log])
        this.tags = tags.filter((tag) => tag instanceof ReportTag)
            .sort((a, b) => a.priority - b.priority)
        this.session = this.constructor.session
        this.recursionStack = recursionStack
        this.trace = trace
    }

    static #session = new ReportSession()

    static get session() {
        return this.#session
    }

    static add(log, tagsNames = [], { recursionStack = 0 } = {}) {
        if (recursionStack > 3) return
        delayAction(() => {
            const tags = []
            tags.push(ReportTags.get("default"))
            tagsNames = (Array.isArray(tagsNames) ? tagsNames : [tagsNames])
            tagsNames.forEach((e) => {
                const mTags = e.split(".")
                mTags.forEach((m, i) => {
                    tags.push(ReportTags.get(mTags.slice(0, i + 1).join("."), recursionStack))
                })
            })

            const r = new Report({ log, tags, recursionStack })
            this.process(r)
        })
    }

    static process(report) {
        if (!(report instanceof Report)) {
            throw new TypeError(`Report expected, ${"constructor" in report ? report.constructor.name : typeof report} given`)
        }

        const {
            getTrace, printTrace, db,
        } = report.tags[report.tags.length - 1]
        const badges = report.tags.map((e) => e.badge)
        const level = Math.max(...report.tags.map((e) => e.level))
        const displayLevel = Math.max(...report.tags.map((e) => e.displayLevel))
        const dbEnforceFallback = report.tags.some((e) => e.dbEnforceFallback)

        if (getTrace) report.trace = Report.trace()

        const obj = {
            level,
            displayLevel,
            getTrace,
            printTrace,
            db,
            dbEnforceFallback,
            badges,
            log: report.log,
            original: report,
        }

        this.#hooks.forEach(async (hook) => {
            try {
                await delayAction(() => hook.hook(obj, {
                    recursionStack: obj.original.recursionStack,
                }))
            } catch (e) {
                Report.add([hook.name, e, obj], ["report.hookError"], { recursionStack: ++obj.original.recursionStack })
            }
        })
    }

    static #hooks = []

    static newHook(hook, name) {
        if (typeof hook !== "function") throw new TypeError("Function expected")
        if (typeof name !== "string") throw new TypeError("Name must be string")
        this.#hooks.push({ hook, name })
    }

    static trace() {
        let stack = new Error().stack || ""
        stack = stack.split("\n").map((line) => line.trim())
        return stack.splice(stack[0] === "Error" ? 2 : 1)
    }
}
