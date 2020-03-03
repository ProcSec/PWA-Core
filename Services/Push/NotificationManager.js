import urlBase64ToUint8Array from "@Core/Tools/transformation/text/urlBase64ToUnit8Array"
import NotificationService from "./NotificationService"
import SW from "../SW"
import Report from "../report"

export default class NotificationManager {
    static services = new Map()

    static active = null

    static subscription = null

    static _activeChecked = false

    static get activeChecked() {
        if (this.services.size === 0) return true
        return this._activeChecked
    }

    static get service() {
        return this.services.get(this.active) || null
    }

    static onActiveCheck = []

    static async register(service, endpoint = null) {
        if (!(service instanceof NotificationService)) throw new TypeError("Incorrect Service")
        this.services.set(service.id, service)

        if (endpoint === null) {
            this._activeChecked = true
            return
        }
        const activeCheck = async () => {
            if (SW.registration === false || !("pushManager" in SW.registration)) throw new Error("Push Service Worker is not activated")

            const sub = await SW.registration.pushManager.getSubscription()
            if (sub === null) return

            if (endpoint === sub.endpoint) {
                this.active = service.id
                this.subscription = sub
            }

            this._activeChecked = true

            this.onActiveCheck.forEach((func) => {
                try {
                    func(sub)
                } catch (e) {
                    // Surpressing errors
                }
            })
        }
        if (SW.registration) {
            await activeCheck()
            return
        }
        SW.onSW(activeCheck)
    }

    static async destroy(service) {
        this.services.delete(service.id)
        if (this.active === service.id) {
            this.active = null
            this.subscription = null
        }
    }

    static async unsubscribe(channel) {
        if (channel.service.id !== this.service.id) {
            throw new Error("Inactive service")
        }

        await channel.turnOff(this.subscription.toJSON())
    }

    static async subscribe(channel) {
        if (channel.service.id !== this.service.id) {
            throw new Error("Inactive service")
        }

        if (!this.subscription) await this.activateActiveService()

        await channel.turnOn(this.subscription)
    }

    static async activateActiveService() {
        if (!this.service) throw new Error("No active service")

        const oldSub = await SW.registration.pushManager.getSubscription()
        if (oldSub !== null) await oldSub.unsubscribe()

        const newSub = await SW.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(this.service.publicKey),
        })
        await this.service.activated(newSub)
        this.subscription = newSub
        Report.write("Push subscription made")
    }
}
