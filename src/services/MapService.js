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
    this.loader.LIBRARIES = ['geometry', 'places'];
    this.loader.LANGUAGE = 'nl';
    this.loader.REGION = 'NL';
    this.loader.VERSION = '3.34';
    this.loader.load(function(google) {
      const hour = new Date().getHours()
      const mapStyle = (hour >= 18 || hour <= 6) ? this.mapStyles.night : this.mapStyles.day
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
        styles: mapStyle,
      }

      this.map = new google.maps.Map(element, options)
      this.places = new google.maps.places.PlacesService(this.map);

      if (this.markerController.uid != null) {
        this.markerController.listen(this.map)

        this.map.addListener('click', function(e) {
          this.onMapClick(e);
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
    if (this.markerController.myUserMarker) {
      const visibility = this.markerController.setGrid()
      this.markerController.discover(visibility)
    }
  }

  handleCustomEvent(event) {
    console.log(event)
  }

  onMapClick(e) {
    if (e.placeId) {
      // Stop the default event
      e.stop()

      this.getPlaceDetails(e)
      this.cursorMode = null
    }

    switch(this.cursorMode) {
      case "WARD":
        const data = {
          position: {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
        }
        this.markerController.createWard(data)
        break
      case "SCOUT":
        this.moveScout(e.latLng)
        this.cursorMode = null
        break
    }
  }

  getPlaceDetails(e) {

    // Get details for clicked place
    this.places.getDetails({
      placeId: e.placeId
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        alert(`${place.name} is a ${place.types[0]}`)
      }
    })


    // Render all nearby businesses
    // this.places.nearbySearch({
    //   location: e.latLng,
    //   radius: '500',
    //   type: ['business']
    // }, function(results, status) {
    //   for (var i = 0; i < results.length; i++) {
    //     var place = results[i];
    //     console.dir(place);
    //   }
    // })

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
