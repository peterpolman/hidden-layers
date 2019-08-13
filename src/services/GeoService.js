const Geohash = require('latlon-geohash');

import firebase from 'firebase/app';
import Tile from '../models/Tile';

export default class GeoService {
    constructor() {
        const types = ['water', 'landuse', 'road'];

        this.preloadTiles(types).then(() => {
            const environmentHashes = HL.markerService.getUniqueEnvironmentHashes(HL.user.id, HL.user.position, 8);

            this.updateEnvironment(environmentHashes);
        });

        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        };
        this.watcher = null;
        this.tiles = [];
        this.tileCache = [];
    }

    preloadTiles(types) {
        const HL = window.HL;
        const loader = new THREE.GLTFLoader();

        return new Promise((resolve, reject) => {
            let i = 0;

            for (let type of types) {
                loader.load(`./objects/tile/${type}.gltf`, (gltf) => {
                    gltf.scene.scale.set(12,12,12);
                    gltf.scene.rotation.z = (180 * 0.0174533);
                    gltf.scene.userData = {
                        id: '', // implement for a ground click, drop item or smth like that
                    }
                    this.tileCache[type] = HL.tb.Object3D({obj: gltf.scene, units:'meters' })

                    if (types.length == ++i) {
                        resolve();
                    }
                });
            }
        });
    }

    getFeatureType(position) {
        const xy = MAP.project([position.lng, position.lat]);
        const features = MAP.queryRenderedFeatures(xy);

        return (features.length) ? features[0]['layer'].id : 'road';
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
        const environmentHashes = HL.markerService.getUniqueEnvironmentHashes(HL.user.id, HL.user.position, 8);

        // Remove the old record if they differ
        if (oldHash !== hash) {
            firebase.database().ref('markers').child(oldHash).child(uid).remove();
            firebase.database().ref('markers').child(hash).child(uid).update({
                position: position,
                ref: `users/${uid}`
            });

            HL.user.hashes = HL.markerService.getUniqueHashes(HL.user.id, position, 7);
        }

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

            if (typeof this.tiles[hash] === 'undefined') {
                const type = this.getFeatureType(position);
                const tile = this.tileCache[type];

                if (typeof tile !== 'undefined') {
                    this.tiles[hash] = new Tile(hash, tile, { position: position});
                }
            }
        }
    }

}
