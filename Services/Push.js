/* globals __PACKAGE_PUSH_PUBLIC_CERT */

import urlBase64ToUint8Array from "@Core/Tools/transformation/text/urlBase64ToUnit8Array"
import Report from "./report"
import SW from "./SW"

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
        return [
            {
                on: true,
                icon: "settings_application",
                sign: "Test Subscription",
                description: "This one tests a notification source",
                subscription: { type: "test", id: "test" },
            },
            {
                on: false,
                sign: "Test Subscription 2",
                description: "This one tests a 2nd notification source",
                subscription: { type: "test", id: "test2" },
            },
        ]
    }

    static async configure({ type, id, ...other }, status) {
        return true
    }
}
