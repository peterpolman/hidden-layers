import GoogleMapsLoader from 'google-maps';
import DirectionService from './DirectionService';
import GeoService from './GeoService';
import MarkerService from './MarkerService';
import UserService from './UserService';
import config from '../config.js'

export default class MapService {
  constructor() {
    this.map = null
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
        center: new google.maps.LatLng(52.5, 4.843782),
        zoom: 16,
        // gestureHandling: 'none',
        zoomControl: false,
        mapTypeControl: false,
        scrollwheel: true,
        streetViewControl: false,
        mapTypeId: 'terrain'
      }

      this.map = new google.maps.Map(element, options)
      this.geoService.watchPosition(this.map)
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
    const fromLatlng = new google.maps.LatLng(this.userService.currentUser.userData.position)
    const marker = this.markerService.createDirectionMarker(toLatlng, this.map);
    const ds = new google.maps.DirectionsService

    marker.setMap(this.map)
    this.map.panTo(toLatlng);

    ds.route({
      origin: fromLatlng,
      destination: toLatlng,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status === 'OK') {
        const route = this.directionService.createRoute(response)

        for (var rm of route.markers) {
          rm.setMap(this.map)
        }

        route.path.setMap(this.map)

      } else {
        console.warn('Directions request failed due to ' + status);
      }
    }.bind(this));

  }

  onMarkerClick(e) {
    // const latlng = this.markerService.
    this.map.panTo(e.latlng)
  }
}
