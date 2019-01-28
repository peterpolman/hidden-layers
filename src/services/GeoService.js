import firebase from 'firebase/app';
import 'firebase/auth';
import UserController from '../controllers/UserController'

export default class GeoService {
  constructor() {
    this.signal = 'geo-off'
    this.watcher = null
    this.userController = new UserController(firebase.auth().currentUser.uid)
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

    const uid = this.userController.uid
    const data = {
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    }

    this.userController.updateUser(uid, data)
  }

  onError(err) {
    if (typeof err != 'undefined') {
      this.signal = 'geo-off'
    }
  }
}
