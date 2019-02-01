import Vue from 'vue';
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
                    if (place.types[0] === 'light_rail_station' || place.types[0] === 'transit_station' || place.types[0] === 'train_station' || place.types[0] === 'subway_station') {
                        this.travelTo(place)
                    }
                    else {
                        this.visitStore(place)
                    }
				}
			})
		}
	}

    travelTo(origin) {
        alert('Soon you will be able to travel great distances into new adventures!')
    }

    visitStore(place) {
        const availableItems = {
            ward: {
                slug: 'ward',
                name: 'Ward',
                size: 40,
                amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
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
            },
            potion: {
                slug: 'potion',
                name: 'Potion',
                size: 25,
                amount: (Math.floor(Math.random() * 100) > 90) ? 1 : 0,
            }
        }

        this.storesRef.child(place.place_id).set({
            owner: this.uid,
            id: place.place_id,
            name: place.name,
            category: place.types[0],
            position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            items: availableItems
        })

        this.store = place.place_id
    }

    updateGoblin(id, ) {

    }

    onStoreAdded(id, data) {
		const randInt = Math.floor(Math.random() * 100)

		this.stores[id] = data

		if ( randInt > 85 ) {
			this.goblins[id] = new Goblin(data.position, 40)

			this.goblins[id].marker.addListener('click', (e) => {

                window.dispatchEvent(new CustomEvent('user.click', {
    				detail: id
    			}))

			})

			this.goblins[id].setMap(MAP)
			this.goblins[id].setVisible(false)
		}
	}

	onStoreChanged(id, data) {
        Vue.delete(this.stores, id)
        this.stores[id] = data
	}

}
