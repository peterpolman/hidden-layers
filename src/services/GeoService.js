import UserService from './UserService'

export default class GeoService {
  constructor() {
    this.map = null
    this.watcher = null
    this.userService = new UserService
  }

  watchPosition(map) {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000
    }

    this.map = map

    navigator.geolocation.clearWatch(this.watcher);

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
      console.log('ERROR(' + err.code + '): ' + err.message);
    }
    // location.reload()
  }
}
