import firebase from 'firebase'
import MarkerController from '../controllers/MarkerController'

export default class GeoService {
  constructor() {
    this.signal = 'geo-off'
    this.watcher = null
    this.markerController = new MarkerController(firebase.auth().currentUser.uid)
    this.options = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 30000
    }
  }

  getPosition() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function(r) {
        const position = {
          lat: r.coords.latitude,
          lng: r.coords.longitude
        }
        resolve(position);
      }.bind(this), function(err) {
        reject(err);
      }, this.options);
    }.bind(this))
  }

  watchPosition() {
    navigator.geolocation.clearWatch(this.watcher);
    this.watcher = navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError.bind(this), this.options);
  }

  onWatchPosition(position) {
    this.signal = 'geo-on'

    const uid = this.markerController.uid
    const data = {
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    }

    this.markerController.updateUser(uid, data)
  }

  onError(err) {
    if (typeof err != 'undefined') {
      this.signal = 'geo-off'
      console.log(`Issue with the positioning system: [${err.code}] ${err.message}`);
    }
  }
}
