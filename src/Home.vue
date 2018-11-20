<template>
  <section class="section section-home">
    <button v-on:click="onSignalClick" :class="geoService.signal"></button>
    <div class="google-map" id="home-map"></div>
    <button class="btn btn-logout" v-on:click="logout">
      Logout
    </button>
    <button class="btn-default" v-on:click="onStopClick">
    </button>
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
      isWalking: null
    }
  },
  mounted() {
    this.mapService.init();
    this.isWalking = this.mapService.scoutService.pathService.isWalking
  },
  methods: {
    onStopClick: function() {
      const uid = this.mapService.userService.currentUser.uid;
      this.mapService.scoutService.pathService.remove(uid)
    },
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

  .btn-logout,
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
    right: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn-logout {
    top: 0;
    left: 0;
    font-size: 10px;
    color: #666;
    width: 60px;
    height: 30px;
  }

  .btn-default:before {
    content: "";
    display: inline-block;
    background: #666;
    width: 14px;
    height: 14px;
    position: relative;
  }

  .geo-on,
  .geo-off {
    position: absolute;
    display: flex;
    margin: 10px;
    padding: 0;
    left: 0;
    bottom: 0;
    z-index: 1;
    -webkit-appearance: none;
    background: transparent;
    border: 0;
  }

  .geo-on:before,
  .geo-off:before {
    content: "";
    display: inline-flex;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f65858;
    position: relative;
  }

  .geo-on:before {
    background: #4df04d;
  }

  .geo-off:after {
    content: "Tap to enable GPS";
    display: inline-flex;
    align-items: center;
    justify-content: center;

    position: relative;
    margin-left: .5rem;

    background-color: rgba(0,0,0,0.5);
    color: white;
    font-weight: bold;
    font-size: 10px;
    width: 95px;
    border-radius: 5px;
    height: 20px;
    padding: 0 5px;
  }

</style>
