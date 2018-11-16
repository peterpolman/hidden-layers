<template>
  <section class="section section-home">
    <span v-on:click="onSignalClick" :class="geoService.signal"></span>
    <div class="google-map" id="home-map"></div>
    <button class="btn-logout" v-on:click="logout" v-if="currentUser">
      Logout
    </button>
    <!-- <button class="btn-pan" v-on:click="onPanClick" v-if="showPanBtn">
      Pan
    </button> -->
  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import GeoService from './services/GeoService';
import MapService from './services/MapService';
import UserService from './services/UserService';

export default {
  name: 'home',
  data () {
    return {
      currentUser: {},
      geoService: new GeoService,
      mapService: new MapService,
      userService: new UserService,
    }
  },
  mounted() {
    this.mapService.init();
    this.currentUser = this.userService.currentUser
  },
  methods: {
    onSignalClick: function() {
      const uid = this.mapService.userService.currentUser.uid;
      if (typeof this.mapService.userService.userMarkers[uid].position != 'undefined') {
        this.mapService.map.panTo(this.mapService.userService.userMarkers[uid].position)
      }
      this.geoService.watchPosition()
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
    width: 100%;
    height: 100%;
    margin: 0 auto;
    background: gray;
    display: block;
  }

  .btn-logout {
    position: absolute;
    bottom: .5rem;
    left: .5rem;
    font-size: 10px;
    width: 120px;
    border-radius: 5px;
    width: 60px;
    height: 30px;
    padding: 0 5px;
    background-color: black;
  }

  .btn-default {
    background: white;
    border: 0px;
    margin: 10px;
    padding: 0px;
    position: absolute;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
    height: 40px;
    width: 40px;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
    overflow: hidden;
    top: 0px;
    right: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn-pan:before {
    content: "";
    display: inline-block;
    background: #333;
    width: 7px;
    height: 7px;
    position: relative;
    left: 11px
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

  .gm-style-cc {
    display:none; 
  }
</style>
