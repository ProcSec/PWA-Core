import TransformatorProps from "./TransformatorProps"

export default class Transformator {
    static id = null

    static name = null

    static description = null

    static type = TransformatorProps.type.other

    static get icon() {
        switch (this.type) {
            case TransformatorProps.type.encrypting:
                return "vpn_key"

            case TransformatorProps.type.signing:
                return "verified_user"

            case TransformatorProps.type.hashing:
                return "find_in_page"

            case TransformatorProps.type.encoding:
                return "code"

            default:
                return "gradient"
        }
    }

    data = {}

    _unlockData = null

    _unlocked = false

    get unlocked() {
        return this._unlocked
    }

    constructor(data = {}) {
        this.data = data
    }

    async unlock(input = null, auto = false) {
        this._unlocked = true
        return true
    }

    async lockdown() {
        this._unlocked = false
        this._unlockData = null
        return true
    }

    async _encoder(input, flags) {
        return input
    }

    async _decoder(input, flags) {
        return input
    }

    async open(input, flags = TransformatorProps.flag.autoUnlock) {
        if (!this.unlocked && (flags & TransformatorProps.flag.autoUnlock)) this.unlock(input, true)
        if (!this.unlocked) throw new Error("The key is not unlocked")

        return this._decoder(input, TransformatorProps.flag.none | flags)
    }

    async close(input, flags = TransformatorProps.flag.autoUnlock) {
        if (!this.unlocked && (flags & TransformatorProps.flag.autoUnlock)) this.unlock(input, true)
        if (!this.unlocked) throw new Error("The key is not unlocked")

        return this._encoder(input, TransformatorProps.flag.none | flags)
    }
}
