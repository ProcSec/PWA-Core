import hashCode from "@Core/Tools/transformation/text/hashCode"

export default class NotificationService {
    constructor(key, name = "Unknown Push Service") {
        if (typeof key !== "string") throw new TypeError("Incorrect Public Key")
        if (typeof key !== "string") throw new TypeError("Incorrect Name")
        this.key = key
        this.name = name
    }

    async getList() {
        return []
    }

    get publicKey() {
        return this.key
    }

    get id() {
        return hashCode(this.key)
    }

    activated(subscription) { }

    subscribe(channel, subscription) { }

    unsubscribe(channel, subscription) { }
}
