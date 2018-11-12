import firebase from 'firebase'

import GoogleMapsLoader from 'google-maps';
import DirectionService from './DirectionService';
import MarkerService from './MarkerService';
import UserService from './UserService';

import config from '../config.js'
import MapStyles from '../mapStyles.js'

export default class MapService {
  constructor() {
    this.map = null
    this.route = null
    this.markerService = new MarkerService
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
        zoom: 16,
        zoomControl: false,
        mapTypeControl: false,
        scrollwheel: true,
        streetViewControl: false,
        styles: this.mapStyles
      }

      this.map = new google.maps.Map(element, options)

      this.markerService.listen(this.map)
      this.userService.listen(this.map)

      this.attachListeners()

    }.bind(this))
  }

  attachListeners() {
    this.map.addListener('click', function(e) {
      this.onMapClick(e.latLng);
    }.bind(this))
  }

  onMapClick(toLatlng) {
    if (this.userService.currentUser != null) {
      const fromLatlng = new google.maps.LatLng(this.userService.currentUser.userData.position)
      this.markerService.walk(this.userService.currentUser.uid, fromLatlng, toLatlng, 'WALKING')
    }
  }
}
