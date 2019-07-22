export default class CoreLoaderResult {
    type = 0

    constructor(answer = null, data = null) {
        this._answer = answer
        this._data = data
    }

    get data() {
        return this._data
    }

    get answer() {
        return this._answer
    }
}
