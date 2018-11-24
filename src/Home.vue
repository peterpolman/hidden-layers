<template>
  <section class="section section-home">
    <button v-on:click="onSignalClick" :class="geoService.signal"></button>

    <button v-on:click="onPanUserClick" class="btn-user" v-if="mapService.markerController.myUserMarker">
      {{mapService.markerController.myUserMarker.username}}
    </button>
    <button v-on:click="onPanScoutClick" class="btn-scout">
      Scout
    </button>
    <button v-on:click="onSpawnWardClick" class="btn-ward">
      Ward
    </button>

    <div class="google-map" id="home-map"></div>
    <button class="btn btn-logout" v-on:click="logout">
      Logout
    </button>
    <button class="btn-default" v-on:click="onStopClick" v-if="this.mapService.markerController.isWalking">
    </button>
  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import GeoService from './services/GeoService';
import MapService from './services/MapService';

export default {
  name: 'home',
  data () {
    return {
      uid: firebase.auth().currentUser.uid,
      geoService: new GeoService,
      mapService: new MapService,
      isWalking: null
    }
  },
  mounted() {
    this.mapService.init();
  },
  methods: {
    onSpawnWardClick: function() {
      const customEvent = new CustomEvent('cursor_changed', { detail: "WARD" })
      window.dispatchEvent(customEvent)
    },
    onStopClick: function() {
      this.mapService.markerController.pathService.remove(this.uid)
    },
    onSignalClick: function() {
      this.geoService.watchPosition()
    },
    onPanUserClick: function() {
      this.mapService.map.panTo(this.mapService.markerController.myUserMarker.position)
    },
    onPanScoutClick: function() {
      this.mapService.map.panTo(this.mapService.markerController.myScoutMarker.position)
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

  .btn-ward,
  .btn-user,
  .btn-scout,
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
    bottom: 0px;
    right: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn-ward,
  .btn-user,
  .btn-scout {
    top: 0;
    right: 0;
    font-size: 10px;
    color: #666;
    width: 60px;
    height: 30px;
    z-index: 1;
    font-weight: bold;
  }

  .btn-ward {
    top: 70px;
  }

  .btn-scout  {
    top: 35px;
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
