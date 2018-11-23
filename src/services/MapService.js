import firebase from 'firebase'

import GoogleMapsLoader from 'google-maps';

import MarkerController from '../controllers/MarkerController';

import config from '../config.js'
import MapStyles from '../mapStyles.js'

export default class MapService {
  constructor() {
    this.map = null
    this.route = null
    this.markerController = new MarkerController
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

      }

    }.bind(this))
  }

  onPan() {
    const visibility = this.markerController.setGrid()
    this.markerController.discover(visibility)
  }

  onMapClick(toLatlng) {
    const uid = this.markerController.uid
    const travelMode = "WALKING"
    const fromLatlng = this.markerController.myUserMarker.position
    const path = this.markerController.pathService.paths[uid]

    if (typeof path == 'undefined' || path == null) {
      this.markerController.send(uid, fromLatlng, toLatlng, travelMode)
    }
    else {
      console.log(`Chill dude...`)
    }
  }
}
