export default class LoadState {
    static #state = false;

    static get is() {
        return this.#state
    }

    static set is(a) {
        if (a === true) {
            this.#state = true
            this.ondone()
        }
    }

    static ondone() {}
}
