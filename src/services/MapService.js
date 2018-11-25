import firebase from 'firebase'

import GoogleMapsLoader from 'google-maps';

import MarkerController from '../controllers/MarkerController';

import config from '../config.js'
import MapStyles from '../mapStyles.js'

export default class MapService {
  constructor() {
    this.map = null
    this.route = null
    this.markerController = new MarkerController(firebase.auth().currentUser.uid)
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
        zoom: 17,
        minZoom: 10,
        zoomControl: true,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        scrollwheel: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: this.mapStyles,
      }

      this.map = new google.maps.Map(element, options)

      if (this.markerController.uid != null) {
        this.markerController.listen(this.map)

        this.map.addListener('click', function(e) {
          this.onMapClick(e.latLng);
        }.bind(this))

        this.map.addListener('bounds_changed', function(e) {
          this.onPan()
        }.bind(this))

        window.addEventListener('cursor_changed', function(e) {
          this.cursorMode = e.detail
        }.bind(this))

      }

    }.bind(this))
  }

  onPan() {
    if (this.markerController.myUserMarker && this.markerController.myScoutMarker) {
      const visibility = this.markerController.setGrid()
      this.markerController.discover(visibility)
    }
  }

  onMapClick(latlng) {
    switch(this.cursorMode) {
      case "WARD":
        const data = {
          position: {
            lat: latlng.lat(),
            lng: latlng.lng()
          }
        }
        this.markerController.createWard(data)
        break
      case "SCOUT":
        this.moveScout(latlng)
        break
    }
  }

  moveScout(toLatlng) {
    const myUserMarker = this.markerController.myUserMarker
    const fromLatlng = myUserMarker.position
    const path = this.markerController.pathService.paths[myUserMarker.uid]

    if (typeof path == 'undefined' || path == null) {
      this.markerController.send(fromLatlng, toLatlng)
    }
    else {
      console.log(`Chill dude...`)
    }
  }
}
