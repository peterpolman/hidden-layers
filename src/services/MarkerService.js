const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';

import User from '../models/User.js';
import Scout from '../models/Scout.js';
import Item from '../models/Item.js';

export default class MarkerService {
    constructor() {
        this.uid = firebase.auth().currentUser.uid;
        this.db = firebase.database()
		this.hashes = [];
        this.positions = [];
        this.listeners = [];

        this.markersRef = firebase.database().ref('markers');

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

        this.db.ref(`loot`).on('child_added', (snap) => {
            let hash = Geohash.encode(snap.val().position.lat, snap.val().position.lng, 7);
            this.markersRef.child(hash).child(snap.key).set({
                position: snap.val().position,
                ref: `loot/${snap.key}`
            });
        });
    }

    getUniqueHashes(id, position) {
        const uniques = (a) => {
            let arr = {};
            for (let i in a) {
                arr[a[i]] = a[i]
            }
            return arr;
        }
        let hashes = [];

        this.positions[id] = position;
        for (let id in this.positions) {
            let hash = Geohash.encode(this.positions[id].lat, this.positions[id].lng, 7);
            let neighbours = Geohash.neighbours(hash);

            hashes.push(hash);
            for (let n in neighbours) {
                hashes.push(neighbours[n]);
            }
        }

        return uniques(hashes)
    }

    addListener(hash) {
        const isNotMine = key => {
            const HL = window.HL;
            const isNotMyUser = (HL.user.id !== key);
            const isNotMyScout = (HL.user.scout !== key);

            return (isNotMyUser && isNotMyScout);
        }

        this.listeners[hash] = [];

        // Add new listeners for this geohashes
        this.markersRef.child(hash).on('child_added', (snap) => isNotMine(snap.key)
            ? this.onMarkerAdded(snap.key, snap.val(), hash)
            : ''
        );
        this.markersRef.child(hash).on('child_removed', (snap) => isNotMine(snap.key)
            ? this.onMarkerRemoved(snap.key, hash)
            : ''
        );
    }

    removeListener(hash) {
        // Remove all markers for this geohash
        for (let id in this.listeners[hash]) {
            this.onMarkerRemoved(id, hash)
        }
        this.markersRef.child(hash).off();
        delete this.listeners[hash];
    }

    // A marker is added to geohash
	onMarkerAdded(id, data, hash) {
        const HL = window.HL;
        if (typeof HL.markers[id] === 'undefined') {

            this.listeners[hash][id] = true;

            // Statically get all data for this marker once
            this.db.ref(data.ref).once('value').then((snap) => {
                if (data.ref.startsWith('users')) HL.markers[id] = new User(snap.key, snap.val());
                if (data.ref.startsWith('scouts')) HL.markers[id] = new Scout(snap.key, snap.val());
                if (data.ref.startsWith('loot')) HL.markers[id] = new Item(snap.key, snap.val());

                console.log('Marker is discovered: ', id, data);
            });
        }
	}

	// A marker is removed from geohash
	onMarkerRemoved(id, hash) {
        const HL = window.HL;
        if (typeof HL.markers[id] !== 'undefined') {
            HL.markers[id].remove();
            delete HL.markers[id];
            delete this.listeners[hash][id]
            console.log('Marker is removed: ', id);
        }
	}

}
