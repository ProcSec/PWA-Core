export default class ReportTag {
    constructor(name, {
        badge: {
            bg = "transparent",
            text = "inherit",
            sign = name,
            print = false,
        } = {},
        level = -1, // -1: debug, 0: verbose, 1: info, 2: warn, 3: error
        displayLevel = null,
        getTrace = true,
        db = true,
        dbEnforceFallback = false,
        priority = 0,
    } = {}) {
        this.name = name
        this.badge = {
            bg, text, sign, print,
        }
        this.level = level
        this.displayLevel = (displayLevel === null ? level : displayLevel)
        this.getTrace = getTrace
        this.db = db
        this.dbEnforceFallback = dbEnforceFallback
    }
}
