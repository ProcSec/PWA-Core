import sjcl from "sjcl"
import Transformator from "../../Transformator"
import TransformatorProps from "../../TransformatorProps"

export default class SJCL extends Transformator {
    static id = "sjcl"

    static name = "SJCL"

    static description = "Stanford Javascript Crypto Library"

    static type = TransformatorProps.type.encrypting

    constructor(password = null) {
        super()
        if (password !== null) this.unlock(password)
    }

    #unlockData

    #unlocked = false

    unlock(password, auto) {
        if (auto === true) password = ""

        this.#unlockData = password
        this.#unlocked = true
    }

    encoder(input, flags) {
        return sjcl.codec.base64.fromBits(
            sjcl.codec.utf8String.toBits(
                sjcl.encrypt(this.#unlockData, input),
            ),
        )
    }

    decoder(input, flags) {
        return sjcl.decrypt(
            this.#unlockData, sjcl.codec.utf8String.fromBits(
                sjcl.codec.base64.toBits(input),
            ),
        )
    }
}
