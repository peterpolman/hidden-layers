import firebase from 'firebase/app'
import 'firebase/database'

import GridService from '../services/GridService'

import Item from '../models/Item'

export default class LootController {
	constructor() {
		this.uid = firebase.auth().currentUser.uid
		this.gridService = new GridService()
		this.loot = {}
		this.myWards = []
		this.lootRef = firebase.database().ref('loot')
		this.lootRef.on('child_added', (snap) => {
			this.onLootAdded(snap.key, snap.val())
		})
		this.lootRef.on('child_removed', (snap) => {
			this.onLootRemoved(snap.key, snap.val())
		})
	}

    createMarkerId(latLng) {
        const id = (latLng.lat() + "_" + latLng.lng())
        return id.replace(/\./g, '')
    }

	onLootAdded(key, data) {
		this.loot[key] = new Item(this.uid, key, data.slug, data.name, data.position, data.size, data.amount)

		this.loot[key].marker.addListener('click', (e) => {
			this.pickup(data)
		})

		this.loot[key].marker.setMap(MAP)

		// TODO: Non generic code, should be integrated in itemFactory or itemService
		if (data.slug == 'ward' && data.uid === this.uid) {
			const ward = this.loot[key]
			const id = this.createMarkerId(ward.marker.position)

			this.myWards[id] = ward
		}
	}

	onLootRemoved(key, data) {
		// TODO: Non generic code, should be integrated in itemFactory or itemService
		if (data.slug == 'ward' && data.uid === this.uid) {
			const ward = this.loot[key]
			const id = this.createMarkerId(ward.marker.position)

			delete this.myWards[id]
		}

		this.loot[key].marker.setMap(null)
		delete this.loot[key]
	}

	drop(item, amount) {
		item.amount = amount
		this.lootRef.child(item.id).set(item)
	}

	dropAll(item) {
		this.lootRef.child(item.id).set(item)
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
