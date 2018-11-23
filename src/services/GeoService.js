import MarkerController from '../controllers/MarkerController'

export default class GeoService {
  constructor() {
    this.signal = 'geo-off'
    this.watcher = null
    this.markerController = new MarkerController
  }

  watchPosition() {
    const options = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 30000
    }

    navigator.geolocation.clearWatch(this.watcher);

    this.watcher = navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError.bind(this), options);
  }

  // ICONS: https://ravenmore.itch.io/fantasy-icon-pack

  onWatchPosition(position) {
    this.signal = 'geo-on'

    const uid = this.markerController.uid
    const data = {
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed,
        accuracy: position.coords.accuracy
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
