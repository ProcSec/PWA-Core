import hashCode from "@Core/Tools/transformation/text/hashCode"
import NotificationService from "./NotificationService"
import NotificationChannelDescriptor from "./NotificationChannelDescriptor"

export default class NotificationChannel {
    constructor(service, descriptor, { state = false, status = null }) {
        if (!(service instanceof NotificationService)) throw new TypeError("Incorrect Service")
        if (!(descriptor instanceof NotificationChannelDescriptor)) throw new TypeError("Incorrect Descriptor")
        this.service = service
        this.descriptor = descriptor
        this.state = state
        this.status = status
    }

    get hash() {
        return hashCode(JSON.stringify([this.service.id, this.descriptor.hash]))
    }

    async turnOn(sub) {
        await this.service.subscribe(this, sub)
        this.state = true
    }

    async turnOff(sub) {
        await this.service.unsubscribe(this, sub)
        this.state = false
    }
}
