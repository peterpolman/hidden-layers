import UserService from './UserService'
import MapService from './MapService'

export default class GeoService {
  constructor() {
    this.userService = new UserService
  }

  watchPosition(map) {
    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    }

    this.map = map
    navigator.geolocation.watchPosition(this.onWatchPosition.bind(this), this.onError, options);
  }

  onWatchPosition(position) {
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

  onError(err) {
    console.log('ERROR(' + err.code + '): ' + err.message);
    // this.watchPosition();
  }
}
