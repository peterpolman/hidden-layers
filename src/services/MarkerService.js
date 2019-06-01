const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

import HiddenLayer from '../models/HiddenLayer.js';
import User from '../models/User.js';

export default class MarkerService {
    constructor() {
        this.uid = firebase.auth().currentUser.uid;
        this.db = firebase.database()
		this.hashes = [];
        this.markersRef = firebase.database().ref('markers');
        this.markersLoaded = false;
    }

    load() {
        const MAP = window.MAP;

        MAP.on('load', () => {

            this.db.ref(`users2/${this.uid}`).once('value').then((snap) => {
                const HL = window.HL = new HiddenLayer('3d-objects');
                const position = snap.val().position;

                // Add to layer array before buildings
                MAP.addLayer(HL, '3d-buildings');
                HL.markers[this.uid] = new User(this.uid, snap.val());

                HL.discover(snap.val().position);

                this.loadNearbyMarkers(this.uid, position);

                console.log("Initial discovery! ", snap.key, position);
            });

            // Listen for changes in my user
            this.db.ref(`users2/${this.uid}`).on('child_changed', (snap) => {
                const value = snap.val();

                // // Get the visible markers for the new position
                if (snap.key === 'position') {
                    this.loadNearbyMarkers(this.uid, value);
                    console.log("Discover after position change: ", snap.key, value);
                }
            });
        });
    }

    /*
     * Load nearby markers for the given objects position.
     * @param {string} uid The user id doing the discovery
     * @param {object} position The {lat, lng} for the origin of the discovery
     */
    loadNearbyMarkers(uid, position) {
        const HL = window.HL;
        // Get the old geohash
        let oldHash = Geohash.encode(HL.markers[uid].position.lat, HL.markers[uid].position.lng, 7);
        // Get current geohash
        let hash = Geohash.encode(position.lat, position.lng, 7);
        // Get neighbours for current geohash
        let neighbours = Geohash.neighbours(hash);

        // Check if the hash is changed
        if ((oldHash !== hash) || !this.markersLoaded) {
            console.log('Hash change detected!');

            // Remove the marker record from the old hash
            this.markersRef.child(oldHash).child(uid).remove();

            // Set the new or updated marker record
            this.markersRef.child(hash).child(uid).set({ position: position, ref: `users2/${uid}` });

            // Remove the existing listeners
            for (let l in this.hashes) {
                this.markersRef.child(this.hashes[l]).off()
            }

            // Remove all existing other users from the scene and detach listeners
            for (let uid in HL.markers) {
                if (uid != this.uid) HL.markers[uid].remove()
            }
        }

        this.watchNearbyGeohashes(hash, neighbours);

        this.markersLoaded = true;
    }

    watchNearbyGeohashes(hash, neighbours) {
        // Empty the listeners and set up new ones
        this.hashes = [];

        // Add new listeners for the current geohash if there is a hash change
        this.markersRef.child(hash).on('child_added', (snap) => (this.uid !== snap.key) ? this.onMarkerAdded(snap.key, snap.val()) : '');
        this.markersRef.child(hash).on('child_removed', (snap) => (this.uid !== snap.key) ? this.onMarkerRemoved(snap.key, snap.val()) : '');
        this.hashes.push(hash);

        // Add new listeners for the neighbouring geohashes if there is a hash change
        for (let n in neighbours) {
            this.markersRef.child(neighbours[n]).on('child_added', (snap) => (this.uid !== snap.key) ? this.onMarkerAdded(snap.key, snap.val()) : '');
            this.markersRef.child(neighbours[n]).on('child_removed', (snap) => (this.uid !== snap.key) ? this.onMarkerRemoved(snap.key, snap.val()) : '');
            this.hashes.push(neighbours[n]);
        }
    }

    // A marker is added to geohash
	onMarkerAdded(id, data) {
        const HL = window.HL;
        console.log('Marker is discovered: ', id, data);
        // Statically get all data for this user once
        this.db.ref(data.ref).once('value').then((snap) => {
            HL.markers[id] = new User(id, snap.val());
        });
	}

	// A marker is removed from geohash
	onMarkerRemoved(id, data) {
        const HL = window.HL;
        console.log('Marker is removed: ', id, data);
        HL.markers[id].remove()
		delete HL.markers[id];
	}

}
