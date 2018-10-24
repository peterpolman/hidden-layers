import UserService from './UserService'

export default class GeoService {
  constructor() {
    this.map = null
    this.watcher = null
    this.userService = new UserService
  }

  watchPosition(map) {
    this.map = map
    navigator.geolocation.clearWatch(this.watcher);

    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 5000
    }

    this.watcher = navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError, options);
  }

  onWatchPosition(position) {
    if (this.userService.currentUser != null) {
      const uid = this.userService.currentUser.uid
      const data = {
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      }

      this.userService.updateUser(uid, data)

      this.map.panTo(data.position)
    }
  }

  onError(err) {
    if (typeof err != 'undefined') {
      console.log(`Issue with the positioning system: [${err.code}] ${err.message}`);
    }
  }
}
