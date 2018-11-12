<template>
  <section class="section-home">
    <span v-on:click="onSignalClick" :class="this.geoService.signal"></span>
    <div class="google-map" id="home-map"></div>
    <button v-on:click="logout" v-if="userService.currentUser">Logout</button>

  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import GeoService from './services/GeoService';

import MapService from './services/MapService';
import UserService from './services/UserService';
import MarkerService from './services/MarkerService';

export default {
  name: 'home',
  data () {
    return {
      geoService: new GeoService,
      mapService: new MapService,
      userService: new UserService,
      markerService: new MarkerService,
    }
  },
  mounted() {
    this.mapService.init();
  },
  methods: {
    onSignalClick: function() {
      this.geoService.watchPosition(this.mapService.map)
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

  button {
    position: absolute;
    top: 0;
    left: 0;
    background: black;
    color: white;
    padding: .7rem;
  }

  .geo-on,
  .geo-off {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f65858;
    position: fixed;
    top: 50px;
    left: 1rem;
    z-index: 1;
  }

  .geo-on {
    background: #4df04d;
  }
</style>
