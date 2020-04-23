import delayAction from "@Core/Tools/objects/delayAction"
import ReportTags from "./ReportTags"
import ReportSession from "./ReportSession"
import ReportTag from "./ReportTag"

export default class Report {
    constructor({ log, tags }) {
        this.log = (Array.isArray(log) ? log : [log])
        this.tags = tags.filter((tag) => tag instanceof ReportTag)
            .sort((a, b) => a.priority - b.priority)
        this.session = this.constructor.session
    }

    static #session = new ReportSession()

    static get session() {
        return this.#session
    }

    static add(log, tagsNames = []) {
        const tags = []
        tags.push(ReportTags.get("default"))
        tagsNames.forEach((e) => {
            const mTags = e.split(".")
            mTags.forEach((m, i) => {
                tags.push(ReportTags.get(mTags.slice(0, i + 1).join(".")))
            })
        })

        const r = new Report({ log, tags })
        this.process(r)
    }

    static process(report) {
        if (!(report instanceof Report)) {
            throw new TypeError(`Report expected, ${"constructor" in report ? report.constructor.name : typeof report} given`)
        }

        const {
            level, displayLevel, getTrace, db, dbEnforceFallback,
        } = report.tags[report.tags.length - 1]
        const badges = report.tags.map((e) => e.badge)

        const obj = {
            level,
            displayLevel,
            getTrace,
            db,
            dbEnforceFallback,
            badges,
            log: report.log,
            original: report,
        }

        this.#hooks.forEach(async (hook) => {
            try {
                await delayAction(() => hook.hook(obj))
            } catch (e) {
                Report.add([hook.name, e, obj], ["report.hookError"])
            }
        })
    }

    static #hooks = []

    static newHook(hook, name) {
        if (typeof hook !== "function") throw new TypeError("Function expected")
        if (typeof name !== "string") throw new TypeError("Name must be string")
        this.#hooks.push({ hook, name })
    }
}
