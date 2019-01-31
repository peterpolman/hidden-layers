import firebase from 'firebase/app'
import 'firebase/database'

import User from '../models/User'

export default class ScoutController {
	constructor(uid) {
        const usersRef = firebase.database().ref('users')
        const userConnectionsRef = usersRef.child(uid).child('connections')
        const lastOnlineRef = usersRef.child(uid).child('lastOnline')
        const connectedRef = firebase.database().ref('.info/connected')

		this.uid = uid
        this.myUser = null
		this.users = {}
		this.userNames = []

        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                const connection = userConnectionsRef.push()

                connection.onDisconnect().remove()
                connection.set(true)
                lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)

                this.setMessage(`Is now connected.`)
            }
        })

		usersRef.on('child_added', (snap) => {
			if (snap.key != this.uid) {
				this.onUserAdded(snap.key, snap.val())
			} else {
				this.onMyUserAdded(snap.key, snap.val())
			}

			this.userNames[snap.key] = snap.val().username
		})

		usersRef.on('child_changed', (snap) => {
			if (snap.key != this.uid) {
				this.onUserChanged(snap.key, snap.val())
			} else {
				this.onMyUserChanged(snap.key, snap.val())
			}
		})
    }

	createUser(uid, data) {
		const usersRef = firebase.database().ref('users')

		usersRef.child(uid).set(data)
	}

	updateUser(uid, data) {
		const usersRef = firebase.database().ref('users')

		usersRef.child(uid).update(data)
	}

	removeUser(uid) {
		const usersRef = firebase.database().ref('users')

		usersRef.child(uid).remove()
	}

	setMessage(message) {
		window.dispatchEvent(new CustomEvent('message_add', {
			detail: {
				uid: this.uid,
				message: message,
				timestamp: firebase.database.ServerValue.TIMESTAMP
			}
		}))
	}

	onMyUserAdded(uid, data) {
		this.userInfoWindow = new google.maps.InfoWindow({isHidden: false})

		this.myUser = new User(uid, data.position, data.userClass, data.username, data.email, data.hitPoints)
		this.myUser.marker.addListener('click', (e) => {
			window.dispatchEvent(new CustomEvent('user.click', {
				detail: uid
			}))
			this.setMessage(`Hi!`)

			MAP.panTo(e.latLng)
		})

		this.myUser.setMap(MAP)
		MAP.panTo(this.myUser.marker.position)
	}

	onMyUserChanged(uid, data) {
		this.myUser.setPosition(data.position)

		if (data.mode == "FIGHTING") {
			if (data.hitPoints > 0) {
				this.myUser.setLabel(data.hitDmg)
				this.myUser.setHitPoints(data.hitPoints)
			}
		}

		if (data.mode == "HEALING") {
			const healAmount = data.hitPoints - this.myUser.hitPoints
			if (healAmount > 0) {
				this.myUser.setLabel(healAmount, true)
				this.myUser.setHitPoints(100)
				this.setMessage(`Healed for ${healAmount} hit points!`)
			}
		}
	}

	onUserAdded(uid, data) {
		this.users[uid] = new User(uid, data.position, data.userClass, data.username, data.email, data.hitPoints)
		this.users[uid].marker.addListener('click', (e) => {

			window.dispatchEvent(new CustomEvent('user.click', {
				detail: uid
			}))

			this.users[uid].indicator.setMap(MAP)
		})

		this.users[uid].marker.setMap(MAP)
		this.users[uid].marker.setVisible(false)
	}

	onUserChanged(uid, data) {
		this.users[uid].setPosition(data.position)

		if (data.mode == 'FIGHTING') {
			if (data.hitPoints > 0) {
				this.users[uid].setLabel(data.hitDmg)
				this.users[uid].setHitPoints(data.hitPoints)
				this.users[uid].setMessage(`${this.userNames[data.attacker]} hits ${this.userNames[uid]} for ${data.hitDmg} damage.`)
			}
			else {
				this.users[uid].setHitPoints(0)
				this.users[uid].setMessage(`${this.userNames[data.attacker]} slays ${this.userNames[uid]}!!`)
			}
		}

		if (data.mode == 'HEALING') {
			const healAmount = data.hitPoints - this.users[uid].hitPoints
			if (healAmount > 0) {
				this.users[uid].setLabel(healAmount, true)
				this.users[uid].setHitPoints(100)
				this.users[uid].setMessage(`${this.userNames[data.healer]} heals ${this.userNames[uid]} for ${healAmount} hit points!`)
			}
		}
	}

	onUserRemoved(uid) {
		this.users[uid].marker.setMap(null)
		delete this.users[uid]
	}
}
