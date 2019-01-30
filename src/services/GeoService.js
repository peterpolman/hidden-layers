import firebase from 'firebase/app';
import 'firebase/auth';
import UserController from '../controllers/UserController'

export default class GeoService {
    constructor() {
        this.uid = firebase.auth().currentUser.uid
        this.signal = 'geo-off'
        this.watcher = null
        this.options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 30000
        }
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
        navigator.geolocation.clearWatch(this.watcher);
        this.watcher = navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError.bind(this), this.options);
    }

    onWatchPosition(position) {
        this.signal = 'geo-on'

        const uid = firebase.auth().currentUser.uid
        const data = {
            position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
        }

        new UserController(uid).updateUser(uid, data)
    }

    onError(err) {
        if (typeof err != 'undefined') {
            this.signal = 'geo-off'
        }
    }
}
