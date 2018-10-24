import GoogleMapsLoader from 'google-maps';
import DirectionService from './DirectionService';
import GeoService from './GeoService';
import MarkerService from './MarkerService';
import UserService from './UserService';
import config from '../config.js'

export default class MapService {
  constructor() {
    this.map = null
    this.route = null
    this.directionMarker = null
    this.markerService = new MarkerService
    this.userService = new UserService
    this.directionService = new DirectionService
    this.geoService = new GeoService
    this.loader = GoogleMapsLoader
  }

  init() {
    this.loader.KEY = config.maps.key;
    this.loader.LIBRARIES = [];
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
        mapTypeId: 'terrain'
      }

      this.map = new google.maps.Map(element, options)
      this.geoService.watchPosition(this.map)
      this.userService.listen(this.map)
      this.markerService.listen(this.map)
      this.attachListeners()

    }.bind(this))
  }

  autoRefresh(map, pathCoords) {
    const uid = this.userService.currentUser.uid
    const key = this.markerService.directionMarkers.length
    const data = {
      id: key,
      position: {
        lat: pathCoords[0].lat(),
        lng: pathCoords[0].lng()
      }
    }

    this.markerService.createMarker(key, data)

    for (var i = 0; i < pathCoords.length; i++) {
      setTimeout(function(latlng) {
        const data = {
          position: {
            lat: latlng.lat(),
            lng: latlng.lng()
          }
        }

        this.markerService.updateMarker(key, data)

        if (latlng == pathCoords[pathCoords.length - 1]) {
          this.markerService.removeMarker(key)
        }
      }.bind(this), 1000 * i, pathCoords[i]);
    }
  }

  attachListeners() {
    this.map.addListener('click', function(e) {
      this.onMapClick(e.latLng);
    }.bind(this))
  }

  onMapClick(toLatlng) {
    if (this.userService.currentUser != null) {
      const fromLatlng = new google.maps.LatLng(this.userService.currentUser.userData.position)
      const ds = new google.maps.DirectionsService

      ds.route({
        origin: fromLatlng,
        destination: toLatlng,
        travelMode: 'WALKING'
      }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          this.autoRefresh(this.map, response.routes[0].overview_path);
        } else {
          console.warn('Directions request failed due to ' + status);
        }
      }.bind(this));
    }
  }

  onMarkerClick(e) {
    // const latlng = this.markerService.
    this.map.panTo(e.latlng)
  }
}
