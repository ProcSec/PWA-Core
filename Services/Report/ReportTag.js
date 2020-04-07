export default class ReportTag {
    constructor(name, {
        badge: {
            bg = "#FFFFFF",
            text = "#000000",
            sign = name,
            print = false,
        } = {},
        level = -1,
        displayLevel = 0,
        getTrace = true,
    }) {
        this.name = name
        this.badge = {
            bg, text, sign, print,
        }
        this.level = level
        this.displayLevel = displayLevel
        this.getTrace = getTrace
    }
}
