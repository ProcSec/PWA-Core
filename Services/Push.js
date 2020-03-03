/* globals __PACKAGE_PUSH_PUBLIC_CERT */

import urlBase64ToUint8Array from "@Core/Tools/transformation/text/urlBase64ToUnit8Array"
import Report from "./report"
import SW from "./SW"
import NotificationManager from "./Push/NotificationManager"

export default class Push {
    static requestPermission() {
        return new Promise(((resolve, reject) => {
            const permissionResult = Notification.requestPermission((result) => {
                resolve(result)
            })

            if (permissionResult) {
                permissionResult.then(resolve, reject)
            }
        }))
            .then((permissionResult) => {
                if (permissionResult !== "granted") {
                    throw new Error("Notification permission denied")
                }
            })
    }

    static async getPushProvider() {
        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                __PACKAGE_PUSH_PUBLIC_CERT,
            ),
        }

        const pushSubscription = await SW.registration.pushManager.subscribe(subscribeOptions)
        Report.write("Received PushSubscription: ", JSON.stringify(pushSubscription))

        return pushSubscription
    }

    static async listSources() {
        if (!NotificationManager.activeChecked) {
            await new Promise((resolve) => {
                NotificationManager.onActiveCheck.push(resolve)
            })
        }

        if (!NotificationManager.service) {
            if (NotificationManager.services.size === 1) {
                NotificationManager.active = Array.from(NotificationManager.services.values())[0].id
            }
        }

        try {
            const list = await NotificationManager.service.getList(
                ...(NotificationManager.subscription ? [NotificationManager.subscription] : []
                ),
            )
            return Promise.all(
                list.map(async (item) => (
                    {
                        on: item.state,
                        icon: item.descriptor.icon,
                        sign: await item.descriptor.sign(),
                        description: await item.descriptor.description(),
                        subscription: { type: item.type, id: item.id },
                        channel: item,
                    }
                )),
            )
        } catch (e) {
            // Handle error if not set
        }

        return []
    }

    static async configure(channel, status, el) {
        status = !!status

        if (status) {
            await NotificationManager.subscribe(channel)
        } else {
            await NotificationManager.unsubscribe(channel)
        }
    }
}
