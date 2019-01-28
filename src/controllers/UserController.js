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
		this.users = []
		this.userNames = []

        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                const connection = userConnectionsRef.push()

                connection.onDisconnect().remove()
                connection.set(true)
                lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)

                this.sendMessage('Connected')
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

	sendMessage(message) {
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
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content)
			this.userInfoWindow.open(MAP, this.myUser.marker)

			MAP.panTo(e.latLng)
		})

		this.myUser.marker.setMap(MAP)
		MAP.panTo(this.myUser.marker.position)
	}

	onMyUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.myUser.marker.setPosition(latlng)

		if (data.mode == "FIGHTING") {
			if (data.hitPoints > 0) {
				this.myUser.setLabel(data.hitDmg)
				this.myUser.setHitPoints(data.hp)
			}
			else {
				this.sendMessage(`You got killed by ${this.userNames[data.attacker]}!`)
			}
		}
	}

	onUserAdded(uid, data) {
		this.users[uid] = new User(uid, data.position, data.userClass, data.username, data.email, data.hitPoints)
		this.users[uid].marker.addListener('click', (e) => {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`
			const damage = Math.floor(Math.random() * 10)

			console.log(this.users[uid].marker.visible)

			this.users[uid].indicator.setMap(MAP)
			this.users[uid].update({
				mode: 'FIGHTING',
				hitDmg: damage,
				attacker: this.uid,
				hitPoints: this.users[uid].hitPoints - damage
			})
		})

		this.users[uid].marker.setMap(MAP)
		this.users[uid].marker.setVisible(false)
	}

	onUserChanged(uid, data) {
		this.users[uid].setPosition(data.position)

		if (data.mode == 'FIGHTING') {
			if (data.hitPoints > 0) {
				this.users[uid].setLabel( data.hitDmg )
				this.users[uid].setHitPoints( data.hitPoints )
				this.sendMessage(`hits ${this.userNames[uid]} with ${data.hitDmg} damage.`)
			}
			else {
				this.sendMessage(`I killed ${this.userNames[uid]}`)
				this.users[uid].setHitPoints(100)
			}
		}
	}

	onUserRemoved(uid) {
		this.users[uid].marker.setMap(null)
		delete this.users[uid]
	}
}
