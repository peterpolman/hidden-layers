const Geohash = require('latlon-geohash');
const THREE = window.THREE;

import firebase from 'firebase/app';
import DamagableCharacter from './DamagableCharacter';
import config from '../config.js';

export default class Scout extends DamagableCharacter {
    constructor (id, data) {
        super(id, data);

        this.uid = data.uid;
        this.name = data.name;
        this.marker = null;
        this.indicator = null;
        this.race = 'wolf';
        this.class = 'wolf';
        this.ref = firebase.database().ref('scouts').child(id);
        this.userRef = firebase.database().ref('users').child(data.uid);
        this.markersRef = firebase.database().ref('markers');

        this.setInfo();
    }

    setDestination(e) {
        const origin = [this.position.lng, this.position.lat];
        const destination = [e.lngLat.lng, e.lngLat.lat];
        const url = "https://api.mapbox.com/directions/v5/mapbox/walking/"+[origin, destination].join(';')+"?geometries=geojson&access_token=" + config.mapbox.key;

        return fetch(url).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const options = {
                        path: data.routes[0].geometry.coordinates,
                        duration: data.routes[0].duration * 60
                    }

                    firebase.database().ref('scouts').child(this.id).update({
                        route: {
                            now: firebase.database.ServerValue.TIMESTAMP,
                            start: firebase.database.ServerValue.TIMESTAMP,
                            options: options,
                        }
                    })
                })
            }
        });
    }

    travelTo(data) {
        const HL = window.HL;
        const latLngPath = this.tb.utils.lnglatsToWorld(data.options.path);
        const path = new THREE.CatmullRomCurve3(latLngPath)
        const timeProgress = ((data.now - data.start) / data.options.duration);

        if ((timeProgress < 1) && (typeof path !== 'undefined')) {
            const point = path.getPointAt(timeProgress);
            const lngLat = this.tb.utils.unprojectFromWorld(point);
            const position = { lng: lngLat[0], lat: lngLat[1] };
            const oldHash = Geohash.encode(this.position.lat, this.position.lng, 7);
            const hash = Geohash.encode(position.lat, position.lng, 7);
            const tangent = path.getTangentAt(timeProgress).normalize();
            const axis = new THREE.Vector3(0,0,0);
            const up = new THREE.Vector3(0,1,0);
            const radians = Math.acos(up.dot(tangent));

            axis.crossVectors(up, tangent).normalize();

            // Point the object in the right direction
            this.mesh._setObject({ quaternion: [axis, radians] });

            // Clears existing timer starts a new one
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => {

                // Detect hash change for scout
                if (oldHash !== hash) {
                    // Remove the old record
                    this.markersRef.child(oldHash).child(this.id).remove();
                    this.markersRef.child(hash).child(this.id).update({
                        position: position,
                        ref: `scouts/${this.id}`
                    });

                    // Retrieve new hash set and update the user hashes
                    this.userRef.update({
                        hashes: HL.markerService.getUniqueHashes(this.id, position)
                    });
                }

                // Update the scout position and route progress in time
                this.ref.update({ position: position });
                this.ref.child('route').update({ now: firebase.database.ServerValue.TIMESTAMP });
            }, 30);
        }
        else {
            HL.selected = null;
            this.world.remove(this.indicator);
            this.ref.child('route').remove();
            this.tb.repaint();
            window.clearTimeout(this.timer);
        }
    }

    onMapClickWhenSelected(e) {
        this.setDestination(e);
    }

    die() {
        alert(`${this.name} is lucky to be alive!`);
        this.heal(100);
    }

    onClick() {
        const HL = window.HL;

        if (HL.selectedItem !== null) {
            this.use(HL.selectedItem);
        }
    }

}
