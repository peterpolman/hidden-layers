const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';
import Tile from '../models/Tile';

export default class GeoService {
    constructor() {
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        };
        this.watcher = null;
        this.tiles = [];
        this.gltf = [];

        const loader = new THREE.GLTFLoader();

        loader.load(`./objects/tile/water.gltf`, (gltf) => {
            this.gltf['water'] = gltf;
        });

        loader.load(`./objects/tile/landuse.gltf`, (gltf) => {
            this.gltf['landuse'] = gltf;
        });

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

            HL.user.hashes = HL.markerService.getUniqueHashes(HL.user.id, position, 7);
        }
        const environmentHashes = HL.markerService.getUniqueEnvironmentHashes(HL.user.id, position, 8);
        this.updateEnvironment(environmentHashes);

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
            const position = {lat: bounds.ne.lat, lng: bounds.ne.lon };
            // const geometry = new THREE.BoxGeometry( 23.5, 19, .25 );
            // const color = this.getFeatureType(bounds.ne);
            // const material = new THREE.MeshBasicMaterial( {color: color } );

            if (typeof this.tiles[hash] != undefined) {
                this.tiles[hash] = new Tile(hash, { position: position});
            }
            // const obj = HL.tb.Object3D({obj: new THREE.Mesh( geometry, material ), units:'meters' }).setCoords([bounds.ne.lon, bounds.ne.lat]);

        }
    }

}
