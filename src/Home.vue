<template>
  <section class="section-home">
    <div class="google-map" id="home-map"></div>
  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import MapService from './services/MapService';
import UserService from './services/UserService';
import MarkerService from './services/MarkerService';

export default {
  name: 'home',
  data () {
    return {
      userService: new UserService,
      markerService: new MarkerService,
    }
  },
  mounted() {
    const mapService = new MapService;
    mapService.init();
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
