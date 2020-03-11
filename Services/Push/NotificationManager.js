import urlBase64ToUint8Array from "@Core/Tools/transformation/text/urlBase64ToUnit8Array"
import Auth from "@App/modules/mono/services/Auth"
import MonoNotificationClusterController from "@App/modules/mono/services/Push/MonoNotificationClusterController"
import NotificationService from "./NotificationService"
import SW from "../SW"
import Report from "../report"

export default class NotificationManager {
    static services = new Map()

    static active = null

    static subscription = null

    static _activeChecked = false

    static get activeChecked() {
        if (this.services.size === 0 || Auth.inited) return true
        return this._activeChecked
    }

    static get service() {
        return this.services.get(this.active) || null
    }

    static reset() {
        MonoNotificationClusterController.list = {}
        this.active = null
        this._activeChecked = null
        this.subscription = null
        this.services.clear()
    }

    static register(service, endpoint = null) {
        return new Promise(async (resolve, reject) => {
            if (!(service instanceof NotificationService)) {
                reject(new TypeError("Incorrect Service"))
                return
            }
            this.services.set(service.id, service)

            if (endpoint === null) {
                this._activeChecked = true
                resolve()
                return
            }
            const activeCheck = async () => {
                if (SW.registration === false || !("pushManager" in SW.registration)) {
                    reject(new Error("Push Service Worker is not activated"))
                    return
                }
                const sub = await SW.registration.pushManager.getSubscription()
                if (sub === null) {
                    resolve()
                    return
                }
                if (endpoint === sub.endpoint) {
                    this.active = service.id
                    this.subscription = sub
                }

                this._activeChecked = true
                resolve()
            }
            if (SW.registration) {
                await activeCheck()
                resolve()
                return
            }
            SW.onSW(activeCheck)
        })
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
