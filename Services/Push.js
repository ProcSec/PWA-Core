import Auth from "@App/modules/mono/services/Auth"
import delayAction from "@Core/Tools/objects/delayAction"
import NotificationManager from "./Push/NotificationManager"

export default class Push {
    static async listSources() {
        await Auth.onInit
        await Auth.waitListReady
        await new Promise((resolve) => delayAction(resolve))

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
