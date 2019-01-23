import config from '../config.js'

export default class  NotificationController {
  constructor() {
    this.isSubscribed = false
    window.swRegistration = null
  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  updateBtn() {
    if (Notification.permission === 'denied') {
      this.updateSubscriptionOnServer(null)
      return
    }
  }

  subscribeUser() {
    const applicationServerKey = this.urlB64ToUint8Array(config.push.public)
    window.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then((subscription) => {
      console.log('User is subscribed.')

      this.updateSubscriptionOnServer(subscription)

      this.isSubscribed = true

      this.updateBtn()

    })
    .catch((err) => {
      console.log('Failed to subscribe the user: ', err)
      this.updateBtn()
    })
  }

  unsubscribeUser() {
    window.swRegistration.pushManager.getSubscription()
    .then((subscription) => {
      if (subscription) {
        return subscription.unsubscribe()
      }
    })
    .catch((error) => {
      console.log('Error unsubscribing', error)
    })
    .then(() => {
      this.updateSubscriptionOnServer(null)

      console.log('User is unsubscribed.')
      this.isSubscribed = false

      this.updateBtn()
    })
  }

  updateSubscriptionOnServer(subscription) {
    if (subscription) {
      console.log( subscription )
      console.log( JSON.stringify(subscription) )
    } else {
      console.log('nothing')
    }
  }
}
