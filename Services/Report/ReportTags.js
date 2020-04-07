import ReportTag from "./ReportTag"

export default class ReportTags {
    static #tags = {}

    static get tags() {
        return this.#tags
    }

    static get(name) {
        return this.#tags[name]
    }

    static add(tag) {
        if (!(tag instanceof ReportTag)) return

        this.#tags[tag.name] = tag
    }
}
