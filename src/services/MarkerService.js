const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';
import 'firebase/database';
import CustomLayer from '../models/CustomLayer.js';
import User from '../models/User.js';

export default class MarkerService {
    constructor() {
        // this.uid = firebase.auth().currentUser.uid
        this.uid = "NM6UXPCKcug5XNvmfJYX7mOgcEs1";
        this.db = firebase.database()
		this.listeners = [];

        this.markers = {};
        this.markersRef = firebase.database().ref('markers');

        // Add my user to the map and discover other markers
		this.db.ref(`users2/${this.uid}`).once('value').then((snap) => {
            var position = snap.val().position;

            this.customLayer = new CustomLayer('3d-scene');
            window.map.addLayer(this.customLayer);

            const user = new User(this.uid, 0xFF0000, position);
            this.markers[this.uid] = user;

            this.customLayer.world.add(this.markers[this.uid].mesh);

            this.discover(position);
		});

        // Listen for changes in my user
        this.db.ref(`users2/${this.uid}`).on('child_changed', (snap) => {
            var value = snap.val();

            // Get the visible markers for the new position
            if (snap.key === 'position') {
                this.markers[this.uid].setPosition(value);
            }
        });

    }

    setMyPosition(position) {
        this.db.ref(`users2/${this.uid}`).child('position').set(position);
    }

    discover(position) {
        // Get current geohash and neigbours
		let hash = Geohash.encode(position.lat, position.lng, 7);
		let neighbours = Geohash.neighbours(hash);

		// Remove the existing listeners
		for (let l in this.listeners) {
			this.markersRef.child(this.listeners[l]).off()
		}

		this.listeners = [];

		// Add new listeners for the current geohash
		this.markersRef.child(hash).on('child_added', (snap) => (snap.key != this.uid) ? this.onMarkerAdded(snap.key, snap.val()) : '');
		this.markersRef.child(hash).on('child_removed', (snap) => (snap.key != this.uid) ? this.onMarkerRemoved(snap.key, snap.val()) : '');
		this.listeners.push(hash);

		// Add new listeners for the neighbouring geohashes
		for (let n in neighbours) {
			this.markersRef.child(neighbours[n]).on('child_added', (snap) => (snap.key != this.uid) ? this.onMarkerAdded(snap.key, snap.val()) : '');
			this.markersRef.child(neighbours[n]).on('child_removed', (snap) => (snap.key != this.uid) ? this.onMarkerRemoved(snap.key, snap.val()) : '');
			this.listeners.push(neighbours[n]);
		}
	}

    // A marker has been added to the geohash, set up a listener for the reference
	onMarkerAdded(id, data) {
        // Statically get all data for this user once
        this.db.ref(data.ref).once('value').then((snap) => {
            var position = snap.val().position;

            this.markers[id] = new User(snap.key, 0xFFFF00, position);
            this.customLayer.world.add(this.markers[id].mesh);
        });

        // Start watching this user for changing properties
        this.db.ref(data.ref).on('child_changed', (snap) => {
            this.markers[id][snap.key] = snap.val();
        });

        // Remove everything when user is removed from geohash
        this.db.ref(data.ref).on('child_removed', (snap) => {
            console.log("Removed: ", snap.val());
        });
	}

	// A marker has been removed from the geohash, remove from list and its
	onMarkerRemoved(id, data) {
		delete this.markersProxy[id];
		this.db.ref(data.ref).off();
	}

}
