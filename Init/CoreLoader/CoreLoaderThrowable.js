import FieldChecker from "@Core/Tools/validation/fieldChecker"

export default class CoreLoaderThrowable {
    #explanation = null

    #data = null

    constructor(explanation, data = null) {
        new FieldChecker({ type: "string" }).set(explanation)

        this.#explanation = explanation
        this.#data = data
    }

    get info() {
        return {
            explanation: this.explanation,
            data: this.data,
        }
    }

    get explanation() { return this.#explanation }

    get data() { return this.#data }
}
