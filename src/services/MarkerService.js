const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

import User from '../models/User.js';
import Scout from '../models/Scout.js';

export default class MarkerService {
    constructor() {
        this.uid = firebase.auth().currentUser.uid;
        this.user = null;
        this.scout = null;
        this.db = firebase.database()
		this.hashes = [];
        this.markersRef = firebase.database().ref('markers');
        this.markersLoaded = false;

        // TEMP: Should be removed when data is migrated.
        // this.rebuildMarkerDatabase();
    }

    // TEMP: Should be removed when data is migrated.
    rebuildMarkerDatabase() {
        this.markersRef.remove();

        this.db.ref(`users2`).on('child_added', (snap) => {
            let hash = Geohash.encode(snap.val().position.lat, snap.val().position.lng, 7);
            this.markersRef.child(hash).child(snap.key).set({
                position: snap.val().position,
                ref: `users2/${snap.key}`
            });
        });

        this.db.ref(`scouts2`).on('child_added', (snap) => {
            let hash = Geohash.encode(snap.val().position.lat, snap.val().position.lng, 7);
            this.markersRef.child(hash).child(snap.key).set({
                position: snap.val().position,
                ref: `scouts2/${snap.key}`
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

        console.log('Reload the markers: ', ((oldHash !== hash) || !this.markersLoaded))

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
            for (let id in HL.markers) {
                if (id !== this.user.id && id !== this.scout.id) HL.markers[id].remove()
            }

            this.watchNearbyGeohashes(hash, neighbours);
        }

        this.markersLoaded = true;
    }

    watchNearbyGeohashes(hash, neighbours) {
        const isNotMine = key => {
            const HL = window.HL;
            const isNotMyUser = (this.uid !== key);
            const isNotMyScout = (HL.markers[this.uid].scout !== key);

            return (isNotMyUser && isNotMyScout);
        }
        // Empty the listeners and set up new ones
        this.hashes = [];

        // Add new listeners for the current geohash if there is a hash change
        this.markersRef.child(hash).on('child_added', (snap) => isNotMine(snap.key) ? this.onMarkerAdded(snap.key, snap.val()) : '');
        this.markersRef.child(hash).on('child_removed', (snap) => isNotMine(snap.key) ? this.onMarkerRemoved(snap.key, snap.val()) : '');

        if (!this.hashes.includes(hash)) this.hashes.push(hash);

        // Add new listeners for the neighbouring geohashes if there is a hash change
        for (let n in neighbours) {
            this.markersRef.child(neighbours[n]).on('child_added', (snap) => isNotMine(snap.key) ? this.onMarkerAdded(snap.key, snap.val()) : '');
            this.markersRef.child(neighbours[n]).on('child_removed', (snap) => isNotMine(snap.key) ? this.onMarkerRemoved(snap.key, snap.val()) : '');

            if (!this.hashes.includes(neighbours[n])) this.hashes.push(neighbours[n]);
        }
    }

    // A marker is added to geohash
	onMarkerAdded(id, data) {
        const HL = window.HL;

        // Statically get all data for this marker once
        this.db.ref(data.ref).once('value').then((snap) => {
            HL.markers[id] = (snap.val().email == null)
                ? new Scout(snap.key, snap.val())
                : new User(snap.key, snap.val());

            console.log('Marker is discovered: ', id, data);
        });
	}

	// A marker is removed from geohash
	onMarkerRemoved(id, data) {
        const HL = window.HL;
        HL.markers[id].remove()
		delete HL.markers[id];

        console.log('Marker is removed: ', id, data);
	}

}
