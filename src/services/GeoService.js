const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';

export default class GeoService {
    constructor() {
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        };
        this.watcher = null;
    }

    stopWatching() {
        return navigator.geolocation.clearWatch(this.watcher);
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(function(r) {
                resolve(r.coords);
            }, (err) => {
                console.warn(`ERROR(${err.code}): ${err.message}`);
                reject(err.message);
            }, this.options);
        })
    }

    watchPosition() {
        return this.watcher = navigator.geolocation.watchPosition(
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
                ref: `users/${uid}`
            });

            HL.user.hashes = HL.markerService.getUniqueHashes(HL.user.id, position);
        }

        this.updateEnvironment(HL.user.hashes);

        // Set the new record
        firebase.database().ref(`users/${uid}`).update({
            position: position,
            hashes: HL.user.hashes,
        });

        return this.position = position;
    }

    updateEnvironment(hashes) {
        const HL = window.HL;
        const MAP = window.MAP;

        for (let hash in hashes) {
            const bounds = Geohash.bounds(hash);
            console.log(bounds);

            var geometry = new THREE.BoxGeometry( 5, 5, 5 );
            var materialGreen = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            var materialBlue = new THREE.MeshBasicMaterial( {color: 0x0000ff} );

            var ne = this.detectType(bounds.ne, 'water');
            var sw = this.detectType(bounds.sw, 'water');
            // var p = this.detectType(bounds.ne, 'park');
            // var s = this.detectType(bounds.ne, 'street');

            console.log(ne);
            console.log(sw);
            if (ne == true || sw == true) debugger
            // console.log(p);
            // console.log(s);

            var ne = HL.tb.Object3D({obj: new THREE.Mesh( geometry, materialGreen ), units:'meters' }).setCoords([bounds.ne.lon, bounds.ne.lat]);
            var sw = HL.tb.Object3D({obj: new THREE.Mesh( geometry, materialBlue ), units:'meters' }).setCoords([bounds.sw.lon, bounds.sw.lat]);

            HL.tb.add(ne);
            HL.tb.add(sw);

            HL.tb.repaint();
        }
    }

    detectType(position, type) {
        const xy = MAP.project([position.lon, position.lat]);
        const features = MAP.queryRenderedFeatures(xy, {layers: [type]});
        console.log(features.length)
        if (!features.length) {
            return;
        }
        return true
    }
}
