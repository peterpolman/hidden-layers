<template>
  <section class="section-home">
    <span style="z-index: 9999; top: 100px;" id="test">test</span>
    <div class="google-map" id="home-map"></div>
    <button v-on:click="logout" v-if="userService.currentUser">Logout</button>

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
      mapService: new MapService,
      userService: new UserService,
      markerService: new MarkerService,
    }
  },
  mounted() {
    this.mapService.init();
  },
  methods: {
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
</style>
