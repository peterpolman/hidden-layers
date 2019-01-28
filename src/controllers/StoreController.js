import firebase from 'firebase/app'
import 'firebase/database'

import Goblin from '../models/Goblin'

export default class StoreController {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.storesRef = firebase.database().ref('stores')
        this.store = null
        this.stores = []
        this.goblins = []

        this.storesRef.on('child_added', (snap) => {
            this.onStoreAdded(snap.key, snap.val())
        })

        this.storesRef.on('child_changed', (snap) => {
            this.onStoreChanged(snap.key, snap.val())
        })
    }

    getPlaceDetails(e) {
        if (this.stores[e.placeId]) {
			this.store = e.placeId
		} else {
			new google.maps.places.PlacesService(MAP).getDetails({ placeId: e.placeId }, (place, status) => {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const availableItems = {
						ward: {
							slug: 'ward',
							name: 'Ward',
                            size: 40,
							amount: Math.floor(Math.random() * 3),
						},
						gold: {
							slug: 'gold',
							name: 'Gold',
                            size: 25,
							amount: Math.floor(Math.random() * 20),
						},
						sword: {
							slug: 'sword',
							name: 'Wooden Sword',
                            size: 25,
							amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
						},
						discover: {
							slug: 'discover',
							name: 'Map',
                            size: 30,
							amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
						}
					}

					this.storesRef.child(e.placeId).set({
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

    onStoreAdded(id, data) {
		const randInt = Math.floor(Math.random() * 100)

		this.stores[id] = data

		if ( randInt > 85 ) {
			this.goblins[id] = new Goblin(data.position, 40)

			this.goblins[id].marker.addListener('click', (e) => {
				const dmg = Math.floor(Math.random() * 10)
				const hitPoints = (this.goblins[id].hitPoints - dmg)

                this.goblins[id].indicator.setMap(MAP)

                if (!this.goblins[id].hasTalked) {
                    this.goblins[id].talk()
                }
                if (this.goblins[id].hitPoints > 0) {
					this.goblins[id].setLabel( dmg )
                    this.goblins[id].setHitPoints( hitPoints )
                    this.goblins[id].setMessage(this.uid, `Goblin takes ${dmg} damage.`)
				}
				else {
					this.goblins[id].setMap(null)
					this.goblins[id].setMessage(this.uid, `Sayonara goblin..`)
				}
			})

			this.goblins[id].setMap(MAP)
			this.goblins[id].setVisible(false)
		}
	}

	onStoreChanged(id, data) {
		this.stores[id] = data
	}

}
