import ReportTag from "./Tag"
import Report from "./Report"

export default class ReportTags {
    static #tags = {}

    static get tags() {
        return this.#tags
    }

    static get(name, recursionStack = 0) {
        if (!(name in this.#tags)) Report.add(name, ["report.unknownTag"], { recursionStack: ++recursionStack })
        return this.#tags[name]
    }

    static add(tag) {
        if (!(tag instanceof ReportTag)) {
            Report.add(tag, ["report.incorrect_tag"])
            return
        }

        this.#tags[tag.name] = tag
    }
}
