import firebase from 'firebase'

import GoogleMapsLoader from 'google-maps';

import MarkerController from '../controllers/MarkerController';
import PathService from '../services/PathService'

import config from '../config.js'
import MapStyles from '../mapStyles.js'

export default class MapController {
  constructor() {
    this.uid = firebase.auth().currentUser.uid
    this.map = null
    this.route = null
    this.pathService = new PathService
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

      this.pathService.init()

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

        window.addEventListener('map_discover', function(e) {
          this.markerController.discover()
        }.bind(this))

      }

    }.bind(this))
  }

  onPan() {
    if (this.markerController.myUserMarker) {
      this.markerController.discover()
    }
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
        const position = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        }
        const data = {
          position: position,
          id: this.markerController.createMarkerId(position)
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
    this.places.nearbySearch({
      location: e.latLng,
      radius: '50',
      type: ['business']
    }, function(results, status) {
      for (var i = 0; i < results.length; i++) {
        var place = results[i];
        console.dir(place.geometry.location);
      }
    })

  }

  moveScout(toLatlng) {
    if (this.markerController.myScout.path == null) {
      this.pathService.route(this.uid, this.markerController.myScout.marker.position, toLatlng, "WALKING").then(function(data){

        this.markerController.myScout.update(data)

        console.log(`Let's walk ${data.totalDist}m`);
      }.bind(this)).catch(function(err) {
        console.log(err)
      })


    }
  }
}
