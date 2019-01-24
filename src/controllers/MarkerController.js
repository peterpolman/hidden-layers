import firebase from 'firebase/app'
import 'firebase/database'

import GridService from '../services/GridService'
import PathService from '../services/PathService'

import Scout from '../models/Scout'
import User from '../models/User'
import Ward from '../models/Ward'
import Gold from '../models/Gold'
import Goblin from '../models/Goblin'
import Path from '../models/Path'

import ScoutSrc from '../assets/img/wolf-0.png'

export default class MarkerController {
	constructor(uid) {
		this.uid = uid
		this.map = null

		this.gridService = new GridService
		this.pathService = new PathService

		this.places = null

		this.connectedRef = firebase.database().ref('.info/connected')

		this.usersRef = firebase.database().ref('users')
		this.scoutsRef = firebase.database().ref('scouts')
		this.lootRef = firebase.database().ref('loot')
		this.storesRef = firebase.database().ref('stores')
		this.wardsRef = null

		this.path = null

		this.myUser = null
		this.myScout = null
		this.myWardMarkers = []

		this.store = null

		this.stores = []
		this.goblins = []
		this.loot = []
		this.users = []
		this.scouts = []

		this.userInfoWindow = null
		this.scoutInfoWindow = null
		this.goblinInfoWindow = null

		this.isWalking = false
		this.numOfUsers = 0
		this.userCount = 0
		this.loading = true

		this.userNames = []
	}

	init(map) {
		const userConnectionsRef = this.usersRef.child(this.uid).child('connections')
		const lastOnlineRef = this.usersRef.child(this.uid).child('lastOnline')

		this.map = map
		this.wardsRef = firebase.database().ref('wards').child(this.uid)

		this.places = new google.maps.places.PlacesService(this.map)

		this.userInfoWindow = new google.maps.InfoWindow({isHidden: false})
		this.scoutInfoWindow = new google.maps.InfoWindow({isHidden: false})
		this.goblinInfoWindow = new google.maps.InfoWindow({isHidden: false})

		this.usersRef.on('value', (snap) => {
			this.numOfUsers = snap.numChildren()

			if (this.numOfUsers == this.userCount) {
				this.loading = false
			}
		})

		this.connectedRef.on('value', (snap) => {
			if (snap.val() === true) {
				const connection = userConnectionsRef.push()

				connection.onDisconnect().remove()
				connection.set(true)
				lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)

				this.sendMessage('Connected')
			}
		})

		this.usersRef.on('child_added', (snap) => {
			if (snap.key != this.uid) {
				this.onUserAdded(snap.key, snap.val())
			} else {
				this.onMyUserAdded(snap.key, snap.val())
			}

			this.userNames[snap.key] = snap.val().username

		})

		this.usersRef.on('child_changed', (snap) => {
			if (snap.key != this.uid) {
				this.onUserChanged(snap.key, snap.val())
			} else {
				this.onMyUserChanged(snap.key, snap.val())
			}

			this.discover()
		})

		this.storesRef.on('child_added', (snap) => {
			this.onStoreAdded(snap.key, snap.val())
		})

		this.storesRef.on('child_changed', (snap) => {
			this.onStoreChanged(snap.key, snap.val())
		})

		this.scoutsRef.on('child_added', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutAdded(snap.key, snap.val())
			} else {
				this.onMyScoutAdded(snap.key, snap.val())
			}

			this.discover()
		})

		this.scoutsRef.on('child_changed', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutChanged(snap.key, snap.val())
			} else {
				this.onMyScoutChanged(snap.key, snap.val())
			}

			this.discover()
		})

		this.scoutsRef.on('child_removed', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutRemoved(snap.key, snap.val())
			} else {
				this.onMyScoutRemoved(snap.key, snap.val())
			}

			this.discover()
		})

		this.wardsRef.on('child_added', (snap) => {
			this.onWardAdded(snap.key, snap.val())
		})

		this.wardsRef.on('child_removed', (snap) => {
			this.onWardRemoved(snap.key, snap.val())
		})

		this.lootRef.on('child_added', (snap) => {
			this.onLootAdded(snap.key, snap.val())
		})

		this.lootRef.on('child_removed', (snap) => {
			this.onLootRemoved(snap.key, snap.val())
		})

	}

	onStoreAdded(id, data) {
		const randInt = Math.floor(Math.random() * 100)

		this.stores[id] = data
		this.stores[id].items.sort()

		if ( randInt > 85 ) {
			this.goblins[id] = new Goblin(this.uid, data.position, 40)

			this.goblins[id].marker.addListener('click', (e) => {
				const content = `<strong>${this.goblins[id].talk()}</strong>`

				this.goblinInfoWindow.setContent(content)
				this.goblinInfoWindow.open(this.map, this.goblins[id].marker)
			})

			this.goblins[id].marker.setMap(this.map)
			this.goblins[id].marker.setVisible(false)
		}
	}

	onStoreChanged(id, data) {
		this.stores[id] = data
		this.stores[id].items.sort()
	}

	createMarkerId(latLng) {
		const id = (latLng.lat + "_" + latLng.lng)
		return id.replace(/\./g, '')
	}

	discover() {
		let visible, visibility

		if (this.myScout != null) {
			visibility = this.gridService.setGrid(this.myUser.marker, this.myScout.marker, this.myWardMarkers)
		}
		else {
			visibility = this.gridService.setGrid(this.myUser.marker, null, this.myWardMarkers)
		}

		// Should not be removed once out of the bounds_changed event
		this.map.data.forEach((feature) => {
			this.map.data.remove(feature)
		})

		this.map.data.add({geometry: new google.maps.Data.Polygon(visibility)})
		this.map.data.setStyle({fillColor: '#000', fillOpacity: .75, strokeWeight: 0, clickable: false})

		visible = new google.maps.Polygon({paths: visibility})

		this.users = this.gridService.discover(this.users, visible)
		this.scouts = this.gridService.discover(this.scouts, visible)
		this.loot = this.gridService.discover(this.loot, visible)
		this.goblins = this.gridService.discover(this.goblins, visible)
	}

	onWardAdded(id, data) {
		const ward = new Ward(this.uid, data.position, 40, this.map)

		ward.addListener('click', (e) => {
			this.removeWard(id)
		})

		this.myWardMarkers[id] = ward

		this.discover()
	}

	onWardRemoved(id, val) {
		this.myWardMarkers[id].setMap(null)
		delete this.myWardMarkers[id]
		this.discover()
	}

	onLootAdded(id, data) {
		this.loot[id] = new Gold(this.uid, this.id, data.position, 25, data.amount)

		this.loot[id].marker.addListener('click', (e) => {
			alert(`You picked up ${data.amount} Gold`)
			this.removeGold(data)
		})

		this.loot[id].marker.setMap(this.map)
		this.loot[id].marker.setVisible(false)

		this.discover()
	}

	onLootRemoved(id, val) {
		this.loot[id].marker.setMap(null)
		delete this.loot[id]

		this.discover()
	}

	onMyUserAdded(uid, data) {
		this.myUser = new User(uid, data.position, data.userClass, data.username, data.email, 50)
		this.myUser.marker.addListener('click', (e) => {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content)
			this.userInfoWindow.open(this.map, this.myUser.marker)

			this.map.panTo(e.latLng)
		})

		this.myUser.marker.setMap(this.map)
		this.map.panTo(this.myUser.marker.position)
	}

	onMyUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.myUser.marker.setPosition(latlng)
	}

	onUserAdded(uid, data) {
		this.users[uid] = new User(uid, data.position, data.userClass, data.username, data.email, 50)
		this.users[uid].marker.addListener('click', (e) => {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content)
			this.userInfoWindow.open(this.map, this.users[uid].marker)

			this.map.panTo(e.latLng)
			this.sendMessage(`Hi ${data.username}!`)
		})

		this.users[uid].marker.setMap(this.map)
		this.users[uid].marker.setVisible(true)
	}

	onUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.users[uid].marker.setPosition(latlng)
	}

	onUserRemoved(uid) {
		this.users[uid].marker.setMap(null)
		delete this.users[uid]
	}

	onMyScoutAdded(uid, data) {
		this.myScout = new Scout(uid, data.mode, data.position, data.hp)
		this.myScout.setMap(this.map)

		this.myScout.marker.addListener('click', (e) => {
			this.map.panTo(e.latLng)
			window.dispatchEvent(new CustomEvent('cursor_changed', { detail: { type: "SCOUT" } }))
		})

		if (data.mode == "WALKING") {
			this.isWalking = true

			if (this.myScout.path == null) {
				this.myScout.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB')
				this.myScout.path.setMap(this.map)
			}

			this.myScout.nextStep(data, this.path)
		}
	}

	onMyScoutChanged(uid, data) {
		this.myScout.set('mode', data.mode)
		this.isWalking = false
		clearTimeout(this.myScout.pathTimer)

		if (data.mode == "FIGHTING") {
			if (data.hp > 0) {
				this.myScout.setLabel(data.hitDmg)
				this.myScout.setHitPoints(data.hp)
			}
		}

		if (data.mode == "WALKING") {
			this.isWalking = true
			this.myScout.setPosition(data.position)

			if (this.myScout.path == null) {
				this.myScout.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB')
				this.myScout.path.setMap(this.map)
			}

			this.myScout.nextStep(data)
		}

		if (data.mode == "STANDING") {
			if (this.myScout.path != null) {
				this.myScout.path.setMap(null)
				this.myScout.path = null

				const title = '🔔 Scout Arrived'
				const options = {
					body: `Scout has stopped walking.`,
					icon: ScoutSrc
				}

				this.sendMessage('Scout has arrived')

				window.swRegistration.showNotification(title, options)
			}
		}
	}

	onMyScoutRemoved(uid, data) {
		this.myScout.marker.setMap(null)
		this.myScout.indicator.setMap(null)
		this.myScout = null
	}

	onScoutAdded(uid, data) {
		this.scouts[uid] = new Scout(uid, data.mode, data.position, data.hp)
		this.scouts[uid].marker.addListener('click', (e) => {
			const dmg = Math.floor(Math.random() * 10)

			this.scouts[uid].setMode("STANDING")
			this.scouts[uid].indicator.setMap(this.map)
			this.scouts[uid].update({
				mode: 'FIGHTING',
				hitDmg: dmg,
				hp: this.scouts[uid].hitPoints - dmg
			})

			this.map.panTo(e.latLng)
		})

		this.scouts[uid].marker.setMap(this.map)
		this.scouts[uid].marker.setVisible(false)
	}

	onScoutChanged(uid, data) {
		this.scouts[uid].set('mode', data.mode)

		if (data.mode == 'FIGHTING') {
			if (data.hp > 0) {
				this.scouts[uid].setLabel( data.hitDmg )
				this.scouts[uid].setHitPoints( data.hp )
				this.sendMessage(`${this.userNames[uid]}'s scout is being attacked!`)
			}
			else {
				this.scouts[uid].die()
			}
		}

		if (data.mode == 'WALKING') {
			this.scouts[uid].setPosition(data.position)
		}
	}

	onScoutRemoved(uid, data) {
		this.scouts[uid].marker.setMap(null)
		this.scouts[uid].indicator.setMap(null)
		delete this.scouts[uid]

		this.sendMessage(`${this.userNames[uid]}'s scout has died...`)
	}

	createUser(uid, data) {
		this.usersRef.child(uid).set(data)
	}

	updateUser(uid, data) {
		this.usersRef.child(uid).update(data)
	}

	removeUser(uid) {
		this.usersRef.child(uid).remove()
	}

	createScout(uid, data) {
		this.scoutsRef.child(uid).set(data)
	}

	createWard(data) {

		if (this.myWardMarkers.length < 3) {
			this.wardsRef.child(data.id).set(data)

			window.dispatchEvent(new CustomEvent('item_substract', {
				detail: {
					id: 'ward',
					name: 'Ward',
					amount: 1,
					class: 'btn-ward',
					callback: 'onDropItem'
				}
			}))
		}
		else {
			alert('You can deploy up to 3 wards.')
		}

	}

	removeWard(id) {
		this.wardsRef.child(id).remove()

		window.dispatchEvent(new CustomEvent('item_add', {
			detail: {
				id: 'ward',
				name: 'Ward',
				amount: 1,
				class: 'btn-ward',
				callback: 'onDropItem'
			}
		}))
	}

	createGold(data) {
		const visibility = this.gridService.setGrid(this.myUser.marker, this.myScout.marker, this.myWardMarkers)
		const visible = new google.maps.Polygon({paths: visibility})
		const latLng = new google.maps.LatLng(data.position)
		const isHidden = google.maps.geometry.poly.containsLocation(latLng, visible)

		if (!isHidden) {

			this.lootRef.child(data.id).set(data)

			window.dispatchEvent(new CustomEvent('item_substract', {
				detail: {
					id: 'gold',
					name: 'Gold',
					amount: data.amount,
					class: 'btn-gold',
					callback: 'onDropItem'
				}
			}))
		}
	}

	removeGold(item) {
		this.lootRef.child(item.id).remove()

		window.dispatchEvent(new CustomEvent('item_add', {
			detail: {
				id: 'gold',
				name: 'Gold',
				amount: item.amount,
				class: 'btn-gold',
				callback: 'onDropItem'
			}
		}))
	}

	getPlaceDetails(e) {
		if (this.stores[e.placeId]) {
			this.store = e.placeId
		} else {
			this.places.getDetails({
				placeId: e.placeId
			}, (place, status) => {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					const dbRef = this.storesRef
					const availableItems = [
						{
							id: 'ward',
							name: 'Ward',
							amount: Math.floor(Math.random() * 3),
							class: 'btn-ward',
							callback: 'onDropItem'
						},
						{
							id: 'gold',
							name: 'Gold',
							amount: Math.floor(Math.random() * 20),
							class: 'btn-gold',
							callback: 'onDropItem'
						},
						{
							id: 'sword',
							name: 'Wooden Sword',
							amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
							class: 'btn-sword',
							callback: 'onFight'
						},
						{
							id: 'discover',
							name: 'Map',
							amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
							class: 'btn-map',
							callback: 'onDiscoverMap'
						}
					]

					dbRef.child(e.placeId).set({
						id: e.placeId,
						owner: this.uid,
						name: place.name,
						category: place.types[0],
						position: {
							lat: place.geometry.location.lat(),
							lng: place.geometry.location.lng()
						},
						items: availableItems
					})

					this.store = e.placeId

				}
			})
		}
	}

	moveScout(toLatlng) {
		if (this.myScout != null && this.myScout.path == null) {
			this.pathService.route(this.uid, this.myScout.marker.position, toLatlng, "WALKING").then((data) => {
				this.myScout.update(data)
			}).catch((err) => {
				console.log(err)
			})
		}
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

}
