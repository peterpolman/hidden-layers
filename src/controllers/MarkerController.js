import firebase from 'firebase/app';
import 'firebase/database';

import GridService from '../services/GridService';
import PathService from '../services/PathService'

import Scout from '../models/Scout';
import User from '../models/User';
import Ward from '../models/Ward'
import Gold from '../models/Gold'
import Goblin from '../models/Goblin'

import ScoutSrc from '../assets/img/wolf-1.png';

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

		this.myUser = null
		this.myScout = null
		this.myWardMarkers = []

		this.store = null
		this.stores = []

		this.goblinMarkers = []
		this.lootMarkers = []

		this.userMarkers = []
		this.scoutMarkers = []

		this.userInfoWindow = null
		this.scoutInfoWindow = null

		this.isWalking = false
	}

	init(map) {
		const userConnectionsRef = this.usersRef.child(this.uid).child('connections');
		const lastOnlineRef = this.usersRef.child(this.uid).child('lastOnline');

		this.map = map
		this.wardsRef = firebase.database().ref('wards').child(this.uid)

		this.places = new google.maps.places.PlacesService(this.map);

		this.userInfoWindow = new google.maps.InfoWindow({isHidden: false});
		this.scoutInfoWindow = new google.maps.InfoWindow({isHidden: false});

		this.connectedRef.on('value', function(snap) {
			if (snap.val() === true) {
				const connection = userConnectionsRef.push();

				connection.onDisconnect().remove();
				connection.set(true);
				lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
			}
		});

		this.usersRef.on('child_added', function(snap) {
			if (snap.key != this.uid) {
				this.onUserAdded(snap.key, snap.val())
			} else {
				this.onMyUserAdded(snap.key, snap.val())
			}
		}.bind(this));

		this.usersRef.on('child_changed', function(snap) {
			if (snap.key != this.uid) {
				this.onUserChanged(snap.key, snap.val())
			} else {
				this.onMyUserChanged(snap.key, snap.val())
			}

			this.discover()
		}.bind(this));

		this.storesRef.on('child_added', function(snap) {
			this.onStoreAdded(snap.key, snap.val());
		}.bind(this));

		this.storesRef.on('child_changed', function(snap) {
			this.onStoreChanged(snap.key, snap.val());
		}.bind(this));

		this.scoutsRef.on('child_added', function(snap) {
			if (snap.key != this.uid) {
				this.onScoutAdded(snap.key, snap.val())
			} else {
				this.onMyScoutAdded(snap.key, snap.val())
			}
		}.bind(this));

		this.scoutsRef.on('child_changed', function(snap) {
			if (snap.key != this.uid) {
				this.onScoutChanged(snap.key, snap.val());
			} else {
				this.onMyScoutChanged(snap.key, snap.val());
			}

			this.discover()
		}.bind(this));

		this.wardsRef.on('child_added', function(snap) {
			this.onWardAdded(snap.key, snap.val());
		}.bind(this));

		this.wardsRef.on('child_removed', function(snap) {
			this.onWardRemoved(snap.key, snap.val());
		}.bind(this));

		this.lootRef.on('child_added', function(snap) {
			this.onLootAdded(snap.key, snap.val());
		}.bind(this));

		this.lootRef.on('child_removed', function(snap) {
			this.onLootRemoved(snap.key, snap.val());
		}.bind(this));

	}

	onStoreAdded(id, data) {
		const randInt = Math.floor(Math.random() * 100)

		this.stores[id] = data
		this.stores[id].items.sort()

		if ( randInt > 85 ) {
			const goblin = new Goblin(this.uid, data.position, 40)
			this.goblinMarkers[id] = goblin.marker

			this.goblinMarkers[id].addListener('click', function(e) {
				alert('Goblin: "' + goblin.greeting + '"');
			})

			this.goblinMarkers[id].setMap(this.map)
			this.goblinMarkers[id].setVisible(false)
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
		this.map.data.forEach(function(feature) {
			this.map.data.remove(feature);
		}.bind(this))

		this.map.data.add({geometry: new google.maps.Data.Polygon(visibility)})
		this.map.data.setStyle({fillColor: '#000', fillOpacity: .5, strokeWeight: 0, clickable: false});

		visible = new google.maps.Polygon({paths: visibility})

		this.userMarkers = this.gridService.discover(this.userMarkers, visible)
		this.scoutMarkers = this.gridService.discover(this.scoutMarkers, visible)
		this.lootMarkers = this.gridService.discover(this.lootMarkers, visible)
		this.goblinMarkers = this.gridService.discover(this.goblinMarkers, visible)
	}

	onWardAdded(id, data) {
		const ward = new Ward(this.uid, data.position, 40, this.map)

		ward.addListener('click', function(e) {
			this.removeWard(id)
		}.bind(this))

		this.myWardMarkers[id] = ward

		this.discover()
	}

	onWardRemoved(id, val) {
		this.myWardMarkers[id].setMap(null)
		delete this.myWardMarkers[id]
		this.discover()
	}

	onLootAdded(id, data) {
		const gold = new Gold(this.uid, this.id, data.position, 25, data.amount)

		gold.addListener('click', function(e) {
			alert(`You picked up ${data.amount} Gold`)
			this.removeGold(data)
		}.bind(this))

		this.lootMarkers[id] = gold
		this.lootMarkers[id].setMap(this.map)
		this.lootMarkers[id].setVisible(false)

		this.discover()
	}

	onLootRemoved(id, val) {
		this.lootMarkers[id].setMap(null)
		delete this.lootMarkers[id]

		this.discover()
	}

	onMyUserAdded(uid, data) {
		this.myUser = new User(uid, data.position, data.userClass, data.username, data.email, 50);
		this.myUser.marker.addListener('click', function(e) {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content);
			this.userInfoWindow.open(this.map, this.myUser.marker);

			this.map.panTo(e.latLng)
		}.bind(this))

		this.myUser.marker.setMap(this.map);
		this.map.panTo(this.myUser.marker.position)

		this.discover()
	}

	onMyUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.myUser.marker.setPosition(latlng)
	}

	onMyScoutAdded(uid, data) {
		this.myScout = new Scout(uid, data.position, 40, data.mode);
		this.myScout.marker.addListener('click', function(e) {
			this.map.panTo(e.latLng)
			this.myScout.marker.setAnimation(google.maps.Animation.BOUNCE)

			window.dispatchEvent(new CustomEvent('cursor_changed', { detail: { type: "SCOUT" } }));
		}.bind(this))

		this.myScout.marker.setMap(this.map);

		this.isWalking = (data.mode == "WALKING")

		if (data.mode == "WALKING") {
 			this.myScout.marker.setPosition(data.position)
		}

		this.discover()
	}

	onMyScoutChanged(uid, data) {
		this.myScout.set('mode', data.mode)

		this.isWalking = (data.mode == "WALKING")

		if (data.mode == "WALKING") {
			this.myScout.setPosition(data.position)

			if (this.myScout.path == null) {
				var path = this.myScout.walk(data)
				path.setMap(this.map)
			}

		}

		if (data.mode == "STANDING") {
			this.myScout.path.setMap(null)
			this.myScout.set('path', null)

			const title = '🔔 Scout Arrived';
			const options = {
				body: `Scout has stopped walking.`,
				icon: ScoutSrc
			};

			window.swRegistration.showNotification(title, options);

		}
	}

	onUserAdded(uid, data) {
		this.userMarkers[uid] = new User(uid, data.position, data.userClass, data.username, data.email, 50).marker;
		this.userMarkers[uid].addListener('click', function(e) {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content);
			this.userInfoWindow.open(this.map, this.userMarkers[uid]);

			this.map.panTo(e.latLng)
		}.bind(this))

		this.userMarkers[uid].setMap(this.map);
		this.userMarkers[uid].setVisible(true);
	}

	onUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.userMarkers[uid].setPosition(latlng)
	}

	onUserRemoved(uid) {
		this.userMarkers[uid].setMap(null)
		delete this.userMarkers[uid]
	}

	onScoutAdded(uid, data) {
		this.scoutMarkers[uid] = new Scout(uid, data.position, 40, data.mode).marker;
		this.scoutMarkers[uid].addListener('click', function(e) {
			const username = this.userMarkers[uid].username
			const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

			this.scoutInfoWindow.setContent(content);
			this.scoutInfoWindow.open(this.map, this.scoutMarkers[uid]);

			this.map.panTo(e.latLng)
		}.bind(this))

		this.scoutMarkers[uid].setMap(this.map);
		this.scoutMarkers[uid].setVisible(false)
	}

	onScoutChanged(uid, data) {
		this.scoutMarkers[uid].setPosition(data.position)
		this.scoutMarkers[uid].set('mode', data.mode)
	}

	createUser(uid, data) {
		this.usersRef.child(uid).set(data)
	}

	updateUser(uid, data) {
		this.usersRef.child(uid).update(data);
	}

	removeUser(uid) {
		this.usersRef.child(uid).remove();
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
			}));
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
		}));
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
			}));
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
		}));
	}

	getPlaceDetails(e) {
		if (this.stores[e.placeId]) {
			this.store = e.placeId
		} else {
			this.places.getDetails({
				placeId: e.placeId
			}, function(place, status) {
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
							amount: 1,
							class: 'btn-sword',
							callback: 'onFight'
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
			}.bind(this))
		}
	}

	moveScout(toLatlng) {
		if (this.myScout.path == null) {
			this.pathService.route(this.uid, this.myScout.marker.position, toLatlng, "WALKING").then(function(data){

				this.myScout.update(data)

				console.log(`Let's walk ${data.totalDist}m`);
			}.bind(this)).catch(function(err) {
				console.log(err)
			})
		}
	}

}
