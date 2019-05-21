const Geohash = require('latlon-geohash');

import firebase from 'firebase/app'
import 'firebase/database'

import UserController from './UserController'
import ScoutController from './ScoutController'

export default class MarkerController {
	constructor() {
		this.uid = firebase.auth().currentUser.uid

		this.users = {}

		this.listeners = []

		this.usersRef = firebase.database().ref('users2')
		this.scoutsRef = firebase.database().ref('scouts2')

		this.myUserRef = firebase.database().ref('users2').child(this.uid)

		this.markersRef = firebase.database().ref('markers')

		this.userController = new UserController(this.uid)
		this.scoutController = new ScoutController(this.uid)

		this.scoutController.userNames = this.userController.userNames

		this.myUserRef.once('value').then((s) => {
			this.userController.onMyUserAdded(s.key, s.val())

			this.getVisibleMarkersForPosition(s.val().position)

			this.myUserRef.on('child_changed', (s) => {
				this.getVisibleMarkersForPosition(s.val().position)
			})

			if (s.val().scout != null) {
				const myScoutRef = firebase.database().ref('scouts2').child(s.val().scout)

				myScoutRef.once('value').then((s) => {
					this.scoutController.onMyScoutAdded(s.key, s.val())

					this.getVisibleMarkersForPosition(s.val().position)

					myScoutRef.on('child_changed', (s) => {
						this.getVisibleMarkersForPosition(s.val().position)
					})
				})
			}
		})

		// this.usersRef.on('child_added', (snap) => {
		// 	let data = snap.val()
		// 	let lat = data.position.lat
		// 	let lng = data.position.lng
		// 	let hash = Geohash.encode(lat, lng, 7)
		//
		// 	firebase.database().ref('users2').child(snap.key).set(data)
		// 	this.markersRef.child(hash).child(snap.key).set(data)
		// })

		// this.scoutsRef.on('child_added', (snap) => {
		// 	let data = snap.val()
		// 	let lat = data.position.lat
		// 	let lng = data.position.lng
		// 	let hash = Geohash.encode(lat, lng, 7)
		//
		// 	let key = firebase.database().ref('scouts2').push().key
		// 	firebase.database().ref('scouts2').child(key).set(data)
		//
		// 	firebase.database().ref('users2').child(snap.key).update({
		// 		scout: key
		// 	})
		//
		// 	this.markersRef.child(hash).child(key).set(data)
		// })
    }

	getVisibleMarkersForPosition(p) {
		// Get current geohash and neigbours
		let hash = Geohash.encode(p.lat, p.lng, 7)
		let neighbours = Geohash.neighbours(hash)

		// Remove the existing listeners
		for (let l in this.listeners) {
			this.markersRef.child(this.listeners[l]).off()
		}
		this.markerListeners = []

		// Add new listeners for the current geohash
		this.markersRef.child(hash).on('child_added', (snap) => this.onMarkerAdded(snap.key, snap.val()))
		this.markersRef.child(hash).on('child_removed', (snap) => this.onMarkerRemoved(snap.key, snap.val()))
		this.markerListeners.push(hash)

		// Add new listeners for the neighbouring geohashes
		for (let n in neighbours) {
			this.markersRef.child(neighbours[n]).on('child_added', (snap) => this.onMarkerAdded(snap.key, snap.val()))
			this.markersRef.child(neighbours[n]).on('child_removed', (snap) => this.onMarkerRemoved(snap.key, snap.val()))
			this.markerListeners.push(neighbours[n])
		}
	}

	// A marker has been added to the geohash
	onMarkerAdded(key, data) {
		console.log(`${(data.email) ? 'User: ' : 'Scout'} ${key}`)
		// console.log(data.email)

		if (data.email != null) {
			this.usersRef.child(key).once('value').then((snap) => {
				if (snap.key != this.uid) {
					this.userController.onUserAdded(snap.key, snap.val())
				} else {
					this.userController.onMyUserAdded(snap.key, snap.val())
				}
			})
			this.usersRef.child(key).on('child_changed', (snap) => {
				if (snap.key != this.uid) {
					this.userController.onUserChanged(snap.key, snap.val())
				} else {
					this.userController.onMyUserChanged(snap.key, snap.val())
				}
			})
			this.usersRef.child(key).on('child_removed', (snap) => this.userController.onUserRemoved(snap.key))
		}

		if (data.email == null) {
			this.scoutsRef.child(key).once('value').then((snap) => {
				if (snap.val().uid != this.uid) {
					this.scoutController.onScoutAdded(snap.key, snap.val())
				} else {
					this.scoutController.onMyScoutAdded(snap.key, snap.val())
				}
			})
			this.scoutsRef.child(key).on('child_changed', (snap) => {
				if (snap.val().uid != this.uid) {
					this.scoutController.onScoutChanged(snap.key, snap.val())
				} else {
					this.scoutController.onMyScoutChanged(snap.key, snap.val())
				}
			})
			this.scoutsRef.child(key).on('child_removed', (snap) => this.scoutController.onScoutRemoved(snap.key))
		}
	}

	// A marker has been removed from the geohash
	onMarkerRemoved(key, data) {
		delete this.users[key]
		this.usersRef.child(key).off()
	}

}
