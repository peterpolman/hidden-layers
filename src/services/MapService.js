import firebase from 'firebase'

import GoogleMapsLoader from 'google-maps';
import ScoutService from './ScoutService';
import UserService from './UserService';

import config from '../config.js'
import MapStyles from '../mapStyles.js'

export default class MapService {
  constructor() {
    this.map = null
    this.route = null
    this.scoutService = new ScoutService
    this.userService = new UserService
    this.loader = GoogleMapsLoader
    this.mapStyles = MapStyles
  }

  init() {
    this.loader.KEY = config.maps.key;
    this.loader.LIBRARIES = ['geometry'];
    this.loader.LANGUAGE = 'nl';
    this.loader.REGION = 'NL';
    this.loader.VERSION = '3.34';
    this.loader.load(function(google) {
      const element = document.getElementById("home-map")
      const options = {
        center: new google.maps.LatLng(52.366, 4.844),
        zoom: 18,
        zoomControl: true,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scrollwheel: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: this.mapStyles,
      }

      this.map = new google.maps.Map(element, options)

      if (this.userService.currentUser != null) {
        this.attachListeners()
      }
    }.bind(this))
  }

  attachListeners() {
    this.scoutService.listen(this.map)
    this.userService.listen(this.map)

    this.scoutService.userMarkers = this.userService.userMarkers

    this.map.addListener('click', function(e) {
      this.onMapClick(e.latLng);
    }.bind(this))
  }

  onMapClick(toLatlng) {
    if (this.userService.currentUser != null) {
      const uid = this.userService.currentUser.uid
      const travelMode = "WALKING"
      const fromLatlng = new google.maps.LatLng(this.userService.currentUser.position)
      const path = this.scoutService.pathService.paths[uid]

      if (typeof path == 'undefined' || path == null) {
        this.scoutService.send(uid, fromLatlng, toLatlng, travelMode)
      }
      else {
        console.log(`Chill dude...`)
      }
    }
  }
}
