<template>
  <section class="section-home">

    <div class="google-map" :id="mapName"></div>

    <a v-on:click="logout" v-if="currentUser">Logout</a>

  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';
import GoogleMapsLoader from 'google-maps';

export default {
  name: 'home',
  data () {
    return {
      currentUser: firebase.auth().currentUser,
      map: null,
      mapName: this.name + "-map",
      markers: [],
      routeMarkers: [],
      routeCoords: [],
      db: firebase.database(),
      position: {}
    }
  },
  mounted() {
    GoogleMapsLoader.KEY = config.maps.key;
    GoogleMapsLoader.LIBRARIES = [];
    GoogleMapsLoader.LANGUAGE = 'nl';
    GoogleMapsLoader.REGION = 'NL';
    GoogleMapsLoader.VERSION = '3.34';
    GoogleMapsLoader.load(function(google) {
      this.initMap();
    }.bind(this))
  },
  methods: {
    initMap() {
      const element = document.getElementById(this.mapName)
      const options = {
        center: new google.maps.LatLng(52.5, 4.843782),
        zoom: 8,
        gestureHandling: 'none',
        zoomControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        streetViewControl: false
      }

      this.map = new google.maps.Map(element, options);

      this.map.addListener('click', function(e) {
        this.handleMapClick(e.latLng);
      }.bind(this));

      this.geolocate();
    },
    getMarkerId(latLng) {
      return latLng.lat() + "_" + latLng.lng()
    },
    handleMarkerClick(e) {
      var id = this.getMarkerId(e.latLng);
      var marker = this.markers[id];
      var position = marker.getPosition();

      this.map.panTo(position);
    },
    handleMarkerRightClick(e) {
      var id = this.getMarkerId(e.latLng);
      var marker = this.markers[id];
      var position = marker.getPosition();

      delete this.markers[id];
      marker.setMap(null)

      // We skip the first result in the array since it is the observer object
      for (var i = 0; i < this.routeMarkers.length; i++) {
        this.routeMarkers[i].setMap(null)
        delete this.routeMarkers[i];
      }

      this.routeMarkers = [{}];

      this.map.panTo(position);
    },
    showRoute(directionResult) {
      var route = directionResult.routes[0].legs[0];

      var icon = {
        path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
        fillColor: '#FF0000',
        fillOpacity: .6,
        anchor: new google.maps.Point(0,0),
        strokeWeight: 0,
        scale: .2
      }

      this.routeCoords.push(new google.maps.LatLng({
        lat: route.steps[0].start_location.lat(),
        lng: route.steps[0].start_location.lng()
      }))

      for (var i = 0; i < route.steps.length; i++) {
        var id = this.getMarkerId(route.steps[i].end_location);
        var marker = new google.maps.Marker({
          position: route.steps[i].end_location,
          map: this.map,
          icon: icon
        });
        this.routeMarkers.push(marker);

        if (route.steps[i].start_location) {
          var coords = new google.maps.LatLng({
            lat: route.steps[i].end_location.lat(),
            lng: route.steps[i].end_location.lng()
          });
          this.routeCoords.push(coords)
        }

      }

      var routePath = new google.maps.Polyline({
        path: this.routeCoords,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: .8,
        strokeWeight: 2
      });

      routePath.setMap(this.map);
    },
    createMarker(latLng) {
      var id = this.getMarkerId(latLng);
      var marker = new google.maps.Marker({
        id: id,
        position: latLng,
        map: this.map
      });

      marker.addListener('click', function(e){
        this.handleMarkerClick(e);
      }.bind(this))

      marker.addListener('rightclick', function(e){
        this.handleMarkerRightClick(e);
      }.bind(this))

      this.markers[id] = marker;
    },
    handleMapClick(latLng) {
      this.createMarker(latLng);

      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer({map: this.map});

      this.calculateAndDisplayRoute(directionsDisplay, directionsService, latLng);
      this.map.panTo(latLng);
    },
    calculateAndDisplayRoute(directionsDisplay, directionsService, destination) {
      directionsService.route({
        origin: this.position,
        destination: destination,
        travelMode: 'WALKING'
      }, function(response, status) {
        if (status === 'OK') {
          this.showRoute(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }.bind(this));
    },
    geolocate: function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        this.position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.map.panTo(this.position)
        this.map.setZoom(16)

        const id = this.getMarkerId(this.position);
        const marker = new google.maps.Marker({
          id: id,
          position: this.position,
          map: this.map,
          animation: google.maps.Animation.DROP
        });

        const users = this.db.ref('users')
        console.log(this.currentUser.uid)
        users.child(this.currentUser.uid).set({
          'position': {
            lat: this.position.lat(),
            lng: this.position.lng()
          }
        });

      }.bind(this))
    },
    logout: function() {
      firebase.auth().signOut().then(() => {
        this.$router.replace('login')
      })
    }
  }
}
</script>

<style scoped>
  .google-map {
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    background: gray;
  }
</style>
