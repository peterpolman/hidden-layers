import UserService from './UserService'

export default class GeoService {
  constructor() {
    this.map = null
    this.signal = 'geo-off'
    this.watcher = null
    this.userService = new UserService
  }

  watchPosition(map) {
    this.map = map
    navigator.geolocation.clearWatch(this.watcher);

    var options = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 30000
    }

    this.watcher = navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError.bind(this), options);
  }

  onWatchPosition(position) {
    this.signal = 'geo-on'

    if (this.userService.currentUser != null) {
      const uid = this.userService.currentUser.uid
      const data = {
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy
        }
      }

      this.userService.updateUser(uid, data)
    }
  }

  onError(err) {
    if (typeof err != 'undefined') {
      this.signal = 'geo-off'
      console.log(`Issue with the positioning system: [${err.code}] ${err.message}`);
    }
  }
}
