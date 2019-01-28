import firebase from 'firebase/app'
import 'firebase/database'

import GridService from '../services/GridService'

import Item from '../models/Item'

export default class LootController {
	constructor() {
		this.uid = firebase.auth().currentUser.uid
		this.gridService = new GridService()
		this.loot = {}
		this.myWardMarkers = []
		this.lootRef = firebase.database().ref('loot')
		this.lootRef.on('child_added', (snap) => {
			this.onLootAdded(snap.key, snap.val())
		})
		this.lootRef.on('child_removed', (snap) => {
			this.onLootRemoved(snap.key, snap.val())
		})
	}

    createMarkerId(latLng) {
        const id = (latLng.lat + "_" + latLng.lng)
        return id.replace(/\./g, '')
    }

	onLootAdded(key, data) {
		this.loot[key] = new Item(this.uid, key, data.slug, data.name, data.position, data.size, data.amount)

		this.loot[key].marker.addListener('click', (e) => {
			this.pickup(data)
		})

		this.loot[key].marker.setMap(MAP)

		if (data.slug == 'ward') {
			const marker = this.loot[key].marker
			const id = this.createMarkerId(marker.position)
			this.myWardMarkers[id] = marker
		}
	}

	onLootRemoved(key, data) {
		if (data.slug == 'ward') {
			const marker = this.loot[key].marker
			const id = this.createMarkerId(marker.position)
			delete this.myWardMarkers[id]
		}

		this.loot[key].marker.setMap(null)
		delete this.loot[key]

	}

	drop(item) {
		this.lootRef.child(item.id).set(item)

		window.dispatchEvent(new CustomEvent('item.substract', {
			detail: item
		}))
	}

	pickup(item) {
		this.lootRef.child(item.id).remove()

		window.dispatchEvent(new CustomEvent('item.add', {
			detail: item
		}))

		this.sendMessage(`Picked up ${item.amount} ${item.name}`)
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
