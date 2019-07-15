import FieldChecker from "@Core/Tools/validation/fieldChecker"

export default class CoreLoaderThrowable {
    _explanation = null

    _data = null

    constructor(explanation, data = null) {
        new FieldChecker({ type: "string" }).set(explanation)

        this._explanation = explanation
        this._data = data
    }

    get info() {
        return {
            explanation: this.explanation,
            data: this.data,
        }
    }

    get explanation() { return this._explanation }

    get data() { return this._data }
}
