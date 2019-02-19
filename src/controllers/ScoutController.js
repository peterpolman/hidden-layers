import firebase from 'firebase/app'
import 'firebase/database'

import PathService from '../services/PathService'

import Scout from '../models/Scout'
import Path from '../models/Path'

export default class ScoutController {
	constructor(uid) {
        this.uid = uid
		this.loaded = false
        this.myScout = null
        this.scouts = []
		this.scoutsRef = firebase.database().ref('scouts')
		this.pathService = new PathService
		this.isWalking = false
		this.scoutsRef.once("value", (s) => {
			let count = 0

	        this.scoutsRef.on('child_added', (snap) => {
				if (snap.key != this.uid) {
					this.onScoutAdded(snap.key, snap.val())
				} else {
					this.onMyScoutAdded(snap.key, snap.val())
				}

				if (s.numChildren() === ++count) {
					this.loaded = true
				}
			})
		})

		this.scoutsRef.on('child_changed', (snap) => {
			if (snap.key != this.uid) {
				this.onScoutChanged(snap.key, snap.val())
			} else {
				this.onMyScoutChanged(snap.key, snap.val())
			}
		})

		this.scoutsRef.on('child_removed', (snap) => {
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
				alert(err)
			})
		}
	}

    onMyScoutAdded(uid, data) {
		this.myScout = new Scout(data)
		this.myScout.setMap(MAP)

		this.myScout.marker.addListener('click', (e) => {
			window.dispatchEvent(new CustomEvent('user.click', { detail: { id: uid, target: 'scout' } }))
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
			if (data.hitPoints > 0) {
				this.myScout.setLabel(data.hitDmg)
				this.myScout.setHitPoints(data.hitPoints)
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
			}
		}
	}

	onMyScoutRemoved(uid, data) {
		this.myScout.marker.setMap(null)
		this.myScout.indicator.setMap(null)
		this.myScout = null
	}

	onScoutAdded(uid, data) {
		this.scouts[uid] = new Scout(data)
		this.scouts[uid].marker.addListener('click', (e) => {
			window.dispatchEvent(new CustomEvent('user.click', { detail: { id: uid, target: 'scout' } }))
		})

		this.scouts[uid].marker.setMap(MAP)
		this.scouts[uid].marker.setVisible(false)
		this.scouts[uid].update({
			hp: null,
			hitPoints: 100
		})
	}

	onScoutChanged(uid, data) {
		this.scouts[uid].set('mode', data.mode)

		if (data.mode == 'FIGHTING') {
			this.scouts[uid].setLabel( data.hitDmg )
			this.scouts[uid].setHitPoints( data.hitPoints )
		}

		if (data.mode == 'WALKING') {
			this.scouts[uid].setPosition(data.position)
		}
	}

	onScoutRemoved(uid, data) {
		this.scouts[uid].die()
		delete this.scouts[uid]
	}

}
