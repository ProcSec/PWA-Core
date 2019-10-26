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

    unlock(password, auto) {
        if (auto === true) password = ""

        this._unlockData = password
        this._unlocked = true
    }

    _encoder(input, flags) {
        return sjcl.codec.base64.fromBits(
            sjcl.codec.utf8String.toBits(
                sjcl.encrypt(this._unlockData, input),
            ),
        )
    }

    _decoder(input, flags) {
        return sjcl.decrypt(
            this._unlockData, sjcl.codec.utf8String.fromBits(
                sjcl.codec.base64.toBits(input),
            ),
        )
    }
}
