import firebase from 'firebase';

import PathService from '../services/PathService';
import GridService from '../services/GridService';

import Scout from '../models/Scout';
import User from '../models/User';

import Ward from '../models/Ward'

export default class MarkerController {
	constructor(uid) {
		this.uid = uid
		this.map = null

		this.gridService = new GridService

		this.connectedRef = firebase.database().ref('.info/connected')

		this.usersRef = firebase.database().ref('users')
		this.scoutsRef = firebase.database().ref('scouts')
		this.wardsRef = firebase.database().ref('wards').child(uid)

		this.shopsRef = firebase.database().ref('shops')
		this.itemsRef = firebase.database().ref('items')

		this.myUserMarker = null
		this.myScout = null
		this.myWardMarkers = []

		this.shops = []

		this.userMarkers = []
		this.scoutMarkers = []

		this.numOfWards = 0
		this.numOfGold = 0

		this.userInfoWindow = null
		this.scoutInfoWindow = null

		this.isWalking = false
	}

	listen(map) {
		this.map = map

		this.userInfoWindow = new google.maps.InfoWindow({isHidden: false});
		this.scoutInfoWindow = new google.maps.InfoWindow({isHidden: false});

		const userConnectionsRef = this.usersRef.child(this.uid).child('connections');
		const lastOnlineRef = this.usersRef.child(this.uid).child('lastOnline');

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

			window.dispatchEvent(new CustomEvent('map_discover'))
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

			window.dispatchEvent(new CustomEvent('map_discover'))
		}.bind(this));

		this.wardsRef.on('child_added', function(snap) {
			this.onWardAdded(snap.key, snap.val());
		}.bind(this));

		this.wardsRef.on('child_removed', function(snap) {
			this.onWardRemoved(snap.key, snap.val());
		}.bind(this));

		this.shopsRef.on('child_added', function(snap) {
			this.onShopAdded(snap.key, snap.val());
		}.bind(this));

		this.shopsRef.on('child_changed', function(snap) {
			this.onShopChanged(snap.key, snap.val());
		}.bind(this));

	}

	onShopAdded(key, data) {
		this.shops[key] = data
	}

	onShopChanged(key, data) {
		console.log(this.shops[key])
		this.shops[key] = data
	}

	createMarkerId(latLng) {
		const id = (latLng.lat + "_" + latLng.lng)
		return id.replace(/\./g, '')
	}

	discover() {
		const visibility = this.gridService.setGrid(this.myUserMarker, this.myScout.marker, this.myWardMarkers)

		// Should not be removed once out of the bounds_changed event
		this.map.data.forEach(function(feature) {
			this.map.data.remove(feature);
		}.bind(this))

		this.map.data.add({geometry: new google.maps.Data.Polygon(visibility)})
		this.map.data.setStyle({fillColor: '#000', fillOpacity: .75, strokeWeight: 0, clickable: false});

		const visible = new google.maps.Polygon({paths: visibility})

		this.userMarkers = this.gridService.discover(this.userMarkers, visible)
		this.scoutMarkers = this.gridService.discover(this.scoutMarkers, visible)
	}

	onWardRemoved(id, val) {
		this.myWardMarkers[id].setMap(null)
		delete this.myWardMarkers[id]
		window.dispatchEvent(new CustomEvent('map_discover'))
		this.numOfWards = this.myWardMarkers.length
	}

	onWardAdded(id, data) {
		const ward = new Ward(this.uid, data.position, 40, this.map)

		ward.addListener('click', function(e) {
			this.removeWard(id)
		}.bind(this))

		this.myWardMarkers[id] = ward

		window.dispatchEvent(new CustomEvent('map_discover'))

		this.numOfWards = this.myWardMarkers.length
	}

	onMyUserAdded(uid, data) {
		this.myUserMarker = new User(uid, data.position, data.userClass, data.username, data.email, 50, this.map, true);
		this.myUserMarker.addListener('click', function(e) {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content);
			this.userInfoWindow.open(this.map, this.myUserMarker);

			this.map.panTo(e.latLng)
		}.bind(this))

		this.myUserMarker.setMap(this.map);
		this.map.panTo(this.myUserMarker.position)
	}

	onMyUserChanged(uid, data) {
		const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
		this.myUserMarker.setPosition(latlng)
	}

	onMyScoutAdded(uid, data) {
		this.myScout = new Scout(uid, data.position, 40, data.mode);
		this.myScout.marker.addListener('click', function(e) {
			this.map.panTo(e.latLng)

			window.dispatchEvent(new CustomEvent('cursor_changed', {detail: "SCOUT"}));

		}.bind(this))

		this.myScout.marker.setMap(this.map);

		this.isWalking = (data.mode == "WALKING")

		if (data.mode == "WALKING") {
			if (this.myScout.path == null) {
				this.myScout.walk(data, this.map)
			}
		}
	}

	onMyScoutChanged(uid, data) {
		this.myScout.setPosition(data.position)
		this.myScout.set('mode', data.mode)

		this.isWalking = (data.mode == "WALKING")

		if (data.mode == "WALKING") {
			if (this.myScout.path == null) {
				this.myScout.walk(data, this.map)
			}
		}

		if (data.mode == "STANDING") {
			this.myScout.path.setMap(null)
			this.myScout.set('path', null)

			if (uid != this.uid) {
				const title = '🔔 Scout Arrived';
				const options = {
					body: `Your scout arrived at its destination!`,
					icon: scoutSrc
				};
				window.swRegistration.showNotification(title, options);
			}

		}
	}

	onUserAdded(uid, data) {
		this.userMarkers[uid] = new User(uid, data.position, data.userClass, data.username, data.email, 50, this.map, false);
		this.userMarkers[uid].addListener('click', function(e) {
			const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

			this.userInfoWindow.setContent(content);
			this.userInfoWindow.open(this.map, this.userMarkers[uid]);

			this.map.panTo(e.latLng)
		}.bind(this))

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

	createShop(data) {
		this.shopsRef.child(data.id).set(data)
	}

	updateShop(data) {
		this.shopsRef.child(data.id).update(data);
	}

	createScout(uid, data) {
		this.scoutsRef.child(uid).set(data)
	}

	createWard(data) {
		if (this.myWardMarkers.length < 5) {
			this.wardsRef.child(data.id).set(data)
		}
	}

	removeWard(id) {
		this.wardsRef.child(id).remove()
	}

}
