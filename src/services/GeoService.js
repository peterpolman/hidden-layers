const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';

export default class GeoService {
    constructor() {
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        };
        this.watchPosition();
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(function(r) {
                this.updatePosition(r.coords);
                resolve(r.coords);
            }, (err) => {
                reject(err);
            }, this.options);
        })
    }

    watchPosition() {
        return navigator.geolocation.watchPosition(
            (r) => {
                this.updatePosition(r.coords);
            }, (err) => {
                console.log(err);
            }, this.options);
    }

    updatePosition(coords) {
        const HL = window.HL;
        const position = { lat: coords.latitude, lng: coords.longitude };
        const oldHash = Geohash.encode(HL.user.position.lat, HL.user.position.lng, 7);
        const hash = Geohash.encode(position.lat, position.lng, 7);
        const uid = firebase.auth().currentUser.uid;

        // Remove the old record if they differ
        if (oldHash !== hash) {
            firebase.database().ref('markers').child(oldHash).child(uid).remove();
            firebase.database().ref('markers').child(hash).child(uid).update({
                position: position,
                ref: `users2/${uid}`
            });

            HL.user.hashes = HL.markerService.getUniqueHashes(HL.user.id, position);
        }

        // Set the new record
        firebase.database().ref(`users2/${uid}`).update({
            position: position,
            hashes: HL.user.hashes,
        });

        return this.position = position;
    }
}
