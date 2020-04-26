export default class ReportLogger {
    static process(report) {
        if (this.loggingLevel === null || report.displayLevel < this.loggingLevel) return

        const displayBadges = report.badges.filter((e) => e.print)
        const styles = []
        const templateString = displayBadges.reduce((a, c) => {
            styles.push(`background: ${c.bg}; color: ${c.text};`, "")
            return `${a}${a.length ? " " : ""}%c ${c.sign} %c`
        }, "")

        let func = console.log
        if (report.displayLevel === 1) func = console.info
        if (report.displayLevel === 2) func = console.warn
        if (report.displayLevel === 3) func = console.error

        func(templateString, ...styles, ...report.log)
        if (report.printTrace && report.getTrace) this.outputTrace(report.trace)
    }

    static outputTrace(lines) {
        console.groupCollapsed("Trace")
        lines.forEach((line) => {
            console.log(line)
        })
        console.groupEnd()
    }

    static loggingLevel = -1
}
