<template>
  <section class="section-home">

    <div class="google-map" :id="mapName"></div>

    <a v-on:click="logout" v-if="currentUser">Logout</a>

  </section>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'home',
  data () {
    let markerArray = [];

    return {
      currentUser: firebase.auth().currentUser,
      mapName: this.name + "-map",
      markerCoordinates: [{

      }],
      map: null,
      bounds: null,
      markers: []
    }
  },
  mounted() {
    this.geolocate();

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
     this.placeMarkerAndPanTo(e.latLng, this.map);
   }.bind(this));
  },
  methods: {
    placeMarkerAndPanTo(latLng, map) {
      var marker = new google.maps.Marker({
        position: latLng,
        map: map
      });

      marker.addListener('click', function(e){
        var position = this.getPosition();
        console.log(position.lat, position.lng);
        this.map.panTo(this.position)
        // this.setMap(null)
      }.bind(marker))

      map.panTo(latLng);
    },
    geolocate: function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        this.position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        this.map.panTo(this.position)
        this.map.setZoom(16)
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
