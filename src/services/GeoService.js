import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

export default class GeoService {
    constructor() {
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        }
        this.watchPosition();
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(function(r) {
                const position = {
                    lat: r.coords.latitude,
                    lng: r.coords.longitude
                }
                resolve(position);
            }, (err) => {
                reject(err);
            }, this.options);
        })
    }

    watchPosition() {
        return navigator.geolocation.watchPosition(
            (r) => {
                const position = {
                    lat: r.coords.latitude,
                    lng: r.coords.longitude
                };
                MAP.setCenter(position);
                firebase.database().ref(`users2/${firebase.auth().currentUser.uid}`).child('position').set(position);
            }, (err) => {
                console.log(err);
            }, this.options);
    }
}
