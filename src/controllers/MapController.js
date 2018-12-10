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
    this.shop = null
  }

  init() {
    this.loader.KEY = config.maps.key;
    this.loader.LIBRARIES = ['geometry', 'places'];
    this.loader.LANGUAGE = 'nl';
    this.loader.REGION = 'NL';
    this.loader.VERSION = '3.34';
    this.loader.load(function(google) {
      // Don't forget to credit the guy
      google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
      	var EarthRadiusMeters = 6378137.0; // meters
      	var lat1 = this.lat();
      	var lon1 = this.lng();
      	var lat2 = newLatLng.lat();
      	var lon2 = newLatLng.lng();
      	var dLat = (lat2 - lat1) * Math.PI / 180;
      	var dLon = (lon2 - lon1) * Math.PI / 180;
      	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      	var d = EarthRadiusMeters * c;
      	return d;
      }

      google.maps.Polyline.prototype.GetPointAtDistance = function(metres) {
      	// some awkward special cases
      	if (metres == 0)
      		return this.getPath().getAt(0);
      	if (metres < 0)
      		return null;
      	if (this.getPath().getLength() < 2)
      		return null;
      	var dist = 0;
      	var olddist = 0;
      	for (var i = 1; (i < this.getPath().getLength() && dist < metres); i++) {
      		olddist = dist;
      		dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
      	}
      	if (dist < metres) {
      		return null;
      	}
      	var p1 = this.getPath().getAt(i - 2);
      	var p2 = this.getPath().getAt(i - 1);
      	var m = (metres - olddist) / (dist - olddist);
      	return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
      }

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

    }.bind(this))
  }

  onPan() {
    if (this.markerController.myUserMarker && this.markerController.myScout) {
      this.markerController.discover()
    }
  }

  onMapClick(e) {
    if (e.placeId) {
      e.stop()

      const visibility = this.markerController.gridService.setGrid(this.markerController.myUserMarker, this.markerController.myScout.marker, this.markerController.myWardMarkers)
      const visible = new google.maps.Polygon({paths: visibility})
      const isHidden = google.maps.geometry.poly.containsLocation(e.latLng, visible)

      if (!isHidden) {
        this.getPlaceDetails(e)
        this.cursorMode = null
      }
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
    if (this.markerController.shops[e.placeId]) {
      this.shop = this.markerController.shops[e.placeId]
    } else {
      this.places.getDetails({
        placeId: e.placeId
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const data = {
            id: e.placeId,
            owner: this.uid,
            name: place.name,
            category: place.types[0],
            items: [
              {
                name: 'gold',
                amount: 3,
                image: 'gold'
              }
            ]
          }

          this.shop = data
          this.markerController.createShop(data)
        }
      }.bind(this))
    }
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
