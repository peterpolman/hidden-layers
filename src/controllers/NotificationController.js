import config from '../config.js'

export default class NotificationController {
    constructor() {
        this.isSubscribed = false
        window.swRegistration = null
    }

    urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    verifyPermission() {
        if (Notification.permission === 'granted') {
            this.isSubscribed = true

            return true
        } else {
            this.isSubscribed = false

            this.updateSubscriptionOnServer(null)
            return false
        }
    }

    subscribeUser() {
        const applicationServerKey = this.urlB64ToUint8Array(config.push.public)
        window.swRegistration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey}).then((subscription) => {
            console.log('User is subscribed.')

            this.updateSubscriptionOnServer(subscription)

            this.isSubscribed = true

            this.verifyPermission()

        }).catch((err) => {
            console.log('Failed to subscribe the user: ', err)
            this.verifyPermission()
        })
    }

    unsubscribeUser() {
        window.swRegistration.pushManager.getSubscription().then((subscription) => {
            if (subscription) {
                console.log(subscription);

                return subscription.unsubscribe().then(function () {
                    console.log(subscription);
                    console.info('Push notification unsubscribed.');
                    this.isSubscribed = false
                    window.location.reload()
                })
                .catch(function (error) {
                    console.error(error);
                });
            }
        }).catch((error) => {
            console.log('Error unsubscribing', error)
        }).then(() => {
            this.updateSubscriptionOnServer(null)

            console.log('User is unsubscribed.')
        })
    }

    updateSubscriptionOnServer(subscription) {
        if (subscription) {
            console.log(subscription)
            console.log(JSON.stringify(subscription))
        } else {
            console.log('nothing')
        }
    }
}
