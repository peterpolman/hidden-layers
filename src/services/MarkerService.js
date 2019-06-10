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
        this.markersLoaded = [];

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

    /*
     * Load nearby markers for the given objects position.
     * @param {string} id The character id doing the discovery
     * @param {object} position The {lat, lng} for the origin of the discovery
     */
    loadNearbyMarkers(id, position, oldHash) {
        const HL = window.HL;
        const hash = Geohash.encode(position.lat, position.lng, 7);
        const neighbours = Geohash.neighbours(hash);

        // Remove the existing listeners for hashes
        for (let i in this.listeners[id]) {
            this.markersRef.child(this.listeners[id][i]).off()
        }
        //
        // // Remove all existing other users from the scene
        // This should only remove the users from a lost geohash
        for (let i in HL.markers) {
            HL.markers[i].remove()
            delete HL.markers[i];
        }

        // Rebuild the list of listeners
        // Fired twice (scout and user) but should create one list with unique hashes.
        this.listeners[id] = [hash]
        for (let n in neighbours) {
            this.listeners[id].push(neighbours[n])
        }

        this.hashes[id] = hash;
        this.positions[id] = position;
        this.markersLoaded[id] = true;

        this.watchNearbyGeohashes(this.listeners[id]);
    }

    watchNearbyGeohashes(listeners) {
        const isNotMine = key => {
            const HL = window.HL;
            const isNotMyUser = (HL.user.id !== key);
            const isNotMyScout = (HL.user.scout !== key);

            return (isNotMyUser && isNotMyScout && isNotExisting);
        }
        const isNotExisting = key => {
            return (typeof HL.markers[key] === 'undefined');
        }

        // Add new listeners for the neighbouring geohashes if there is a hash change
        for (let i in listeners) {
            this.markersRef.child(listeners[i]).on('child_added', (snap) => (isNotMine(snap.key) && isNotExisting)
                ? this.onMarkerAdded(snap.key, snap.val())
                : ''
            );
            this.markersRef.child(listeners[i]).on('child_removed', (snap) => isNotMine(snap.key)
                ? this.onMarkerRemoved(snap.key, snap.val())
                : ''
            );
        }
    }

    // A marker is added to geohash
	onMarkerAdded(id, data) {
        const HL = window.HL;

        // Only create and add it to the scene if it does not exist
        if (typeof HL.markers[id] === 'undefined') {
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
	onMarkerRemoved(id, data) {
        const HL = window.HL;

        if (typeof HL.markers[id] !== 'undefined') {
            HL.markers[id].remove();
            delete HL.markers[id];

            console.log('Marker is removed: ', id, data);
        }
	}

}
