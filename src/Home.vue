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
    bottom: .5rem;
    left: .5rem;
    font-size: 10px;
    width: 80px;
    border-radius: 5px;
    width: 60px;
    height: 30px;
    padding: 0 5px;
    background-color: black;
  }

  .geo-on,
  .geo-off {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1;
  }

  .geo-on:before,
  .geo-off:before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f65858;
    position: absolute;
  }

  .geo-on:before {
    background: #4df04d;
  }

  .geo-off:after {
    content: "Tap to enable GPS";
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    left: 20px;
    margin-left: .5rem;

    background-color: rgba(0,0,0,0.5);
    color: white;
    font-weight: bold;
    font-size: 10px;
    width: 90px;
    border-radius: 5px;
    height: 20px;
    padding: 0 5px;
  }
</style>
