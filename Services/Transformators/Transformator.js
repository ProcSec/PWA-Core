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

    #unlockData = null

    #unlocked = false

    get unlocked() {
        return this.#unlocked
    }

    constructor(data = {}) {
        this.data = data
    }

    async unlock(input = null, auto = false) {
        this.#unlocked = true
        return true
    }

    async lockdown() {
        this.#unlocked = false
        this.#unlockData = null
        return true
    }

    async encoder(input, flags) {
        return input
    }

    async decoder(input, flags) {
        return input
    }

    async open(input, flags = TransformatorProps.flag.autoUnlock) {
        if (!this.unlocked && (flags & TransformatorProps.flag.autoUnlock)) this.unlock(input, true)
        if (!this.unlocked) throw new Error("The key is not unlocked")

        return this.decoder(input, TransformatorProps.flag.none | flags)
    }

    async close(input, flags = TransformatorProps.flag.autoUnlock) {
        if (!this.unlocked && (flags & TransformatorProps.flag.autoUnlock)) this.unlock(input, true)
        if (!this.unlocked) throw new Error("The key is not unlocked")

        return this.encoder(input, TransformatorProps.flag.none | flags)
    }
}
