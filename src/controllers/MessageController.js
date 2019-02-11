import firebase from 'firebase/app';
import 'firebase/database';

export default class MessageController {
    constructor() {
        this.messages = []
        this.messagesOpen = false

        this.messagesRef = firebase.database().ref('messages')
        this.messagesRef.on('child_added', (snap) => this.onMessageAdded(snap.key, snap.val()))
        this.messagesRef.on('child_removed', (snap) => this.onMessageRemoved(snap.key, snap.val()))

        this.listener = window.addEventListener('message.add', (data) => {
            this.add(data.detail)
        })

    }

    sortTimestampDesc(array) {
        let sortable = []

        for (let key in array) {
            sortable.push(array[key])
        }

        return sortable.sort((a, b) => {
            return a.timestamp - b.timestamp
        }).reverse()
    }

    onMessageAdded(key, data) {
        data['key'] = key

        if (this.messages.length > 10) {
            this.messages = this.messages.slice(0, 10)
        }

        this.messages.unshift(data)
    }

    getDateTime(timestamp) {
        const yesterday = Date.now() - (86400 * 1000)

        if (timestamp < yesterday) {
            return `${new Date(timestamp).getMonth() + 1}/${new Date(timestamp).getDate()} - ${new Date(timestamp).getHours()}:${new Date(timestamp).getMinutes()}`
        } else {
            return `${new Date(timestamp).getHours().toString().padStart(2, '0')}:${new Date(timestamp).getMinutes().toString().padStart(2, '0')}`
        }
    }

    onMessageRemoved(key) {
        this.messages.splice(key, 1)
    }

    add(data) {
        this.messagesRef.push().set(data)
    }

    remove(key) {
        this.messagesRef.child(key).remove()
    }

}
