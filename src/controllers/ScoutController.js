import firebase from 'firebase/app'
import 'firebase/database'

import PathService from '../services/PathService'

import Scout from '../models/Scout'
import Path from '../models/Path'

export default class ScoutController {
	constructor(uid) {
        const scoutsRef = firebase.database().ref('scouts')

        this.uid = uid
        this.myScout = null
        this.scouts = []
        this.pathService = new PathService
        this.scoutInfoWindow = new google.maps.InfoWindow({isHidden: false})
		this.isWalking = false

        scoutsRef.on('child_added', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutAdded(snap.key, snap.val())
			} else {
				this.onMyScoutAdded(snap.key, snap.val())
			}
		})

		scoutsRef.on('child_changed', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutChanged(snap.key, snap.val())
			} else {
				this.onMyScoutChanged(snap.key, snap.val())
			}
		})

		scoutsRef.on('child_removed', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutRemoved(snap.key, snap.val())
			} else {
				this.onMyScoutRemoved(snap.key, snap.val())
			}
		})
    }

    get(uid) {
        return this.scouts[uid]
    }

	createScout(uid, data) {
        const scoutsRef = firebase.database().ref('scouts')

		scoutsRef.child(uid).set(data)
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

    onMyScoutAdded(uid, data) {
		this.myScout = new Scout(uid, data.mode, data.position, data.hp)
		this.myScout.setMap(MAP)

		this.myScout.marker.addListener('click', (e) => {
			MAP.panTo(e.latLng)
		})

		if (data.mode == "WALKING") {
			this.isWalking = true

			if (this.myScout.path == null) {
				this.myScout.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB')
				this.myScout.path.setMap(MAP)
			}

			this.myScout.nextStep(data)
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
				this.myScout.path.setMap(MAP)
			}

			this.myScout.nextStep(data)
		}

		if (data.mode == "STANDING") {
			if (this.myScout.path != null) {
				this.myScout.path.setMap(null)
				this.myScout.path = null

				this.myScout.setMessage(`${this.userNames[uid]}'s scout has arrived`)
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
			const damage = Math.floor(Math.random() * 10)

			this.scouts[uid].setMode("STANDING")

			this.scouts[uid].setMessage(`${this.userNames[uid]}'s scout got hit by ${this.userNames[data.attacker]} with ${damage} damage.`)
			this.scouts[uid].indicator.setMap(MAP)
			this.scouts[uid].update({
				mode: 'FIGHTING',
				attacker: this.uid,
				hitDmg: damage,
				hp: this.scouts[uid].hitPoints - damage
			})

			MAP.panTo(e.latLng)
		})

		this.scouts[uid].marker.setMap(MAP)
		this.scouts[uid].marker.setVisible(false)
	}

	onScoutChanged(uid, data) {
		this.scouts[uid].set('mode', data.mode)

		if (data.mode == 'FIGHTING') {
			if (data.hp > 0) {
				this.scouts[uid].setLabel( data.hitDmg )
				this.scouts[uid].setHitPoints( data.hp )
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
		this.scouts[uid].setMessage(`${this.userNames[uid]}'s scout has died...`)
		delete this.scouts[uid]
	}

}
