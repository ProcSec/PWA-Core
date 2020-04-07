export default class CoreLoaderResult {
    type = 0

    #answer

    #data

    constructor(answer = null, data = null) {
        this.#answer = answer
        this.#data = data
    }

    get data() {
        return this.#data
    }

    get answer() {
        return this.#answer
    }
}
