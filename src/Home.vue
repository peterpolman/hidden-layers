<template>
  <section class="section section-home">
    <button v-on:click="onSignalClick" :class="geoService.signal">

    </button>
    <button  v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn-user" v-if="mapService.markerController.myUserMarker">
      {{mapService.markerController.myUserMarker.username}}
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn-scout">
      Scout
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onSpawnWardClick" class="btn-ward">
      Ward
    </button>
    <button class="btn btn-logout" v-on:click="logout">
      EXIT
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.bell + ')', backgroundColor: (isSubscribed) ? '#63EE23' : '#FF6B6B' }" v-on:click="onSetBellClick" class="btn-bell">
      PUSH
    </button>

    <div class="google-map" id="home-map"></div>

    <button class="btn-default" v-on:click="onStopClick" v-if="this.mapService.markerController.isWalking">
    </button>
  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import GeoService from './services/GeoService';
import MapService from './services/MapService';

import KnightImg from './assets/img/knight-1.png'
import ArcherImg from './assets/img/archer-1.png'
import WolfImg from './assets/img/wolf-1.png'
import WardImg from './assets/img/ward-1.png'
import BellImg from './assets/img/badge.png'

export default {
  name: 'home',
  data () {
    return {
      isSubscribed: false,
      assets: {
        ward: WardImg,
        knight: KnightImg,
        scout: WolfImg,
        archer: ArcherImg,
        bell: BellImg
      },
      uid: firebase.auth().currentUser.uid,
      geoService: new GeoService,
      mapService: new MapService,
      isWalking: null,
      userClass: null
    }
  },
  mounted() {
    this.mapService.init();

    window.swRegistration = null;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('sw.js')
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        window.swRegistration = swReg;
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    } else {
      console.warn('Push messaging is not supported');
    }

    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      window.swRegistration = swReg;
      this.initializeUI();
    }.bind(this))
  },
  methods: {
    initializeUI() {
      window.swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        this.isSubscribed = !(subscription === null);

        this.updateSubscriptionOnServer(subscription);

        if (this.isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
        }

        this.updateBtn();
      }.bind(this));
    },
    urlB64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
    updateBtn: function() {
      if (Notification.permission === 'denied') {
        this.updateSubscriptionOnServer(null);
        return;
      }
    },
    subscribeUser: function() {
      const applicationServerKey = this.urlB64ToUint8Array(config.push.public);
      window.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
      .then(function(subscription) {
        console.log('User is subscribed.');

        this.updateSubscriptionOnServer(subscription);

        this.isSubscribed = true;

        this.updateBtn();

      }.bind(this))
      .catch(function(err) {
        console.log('Failed to subscribe the user: ', err);
        this.updateBtn();
      });
    },
    unsubscribeUser: function() {
      window.swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        if (subscription) {
          return subscription.unsubscribe();
        }
      })
      .catch(function(error) {
        console.log('Error unsubscribing', error);
      })
      .then(function() {
        this.updateSubscriptionOnServer(null);

        console.log('User is unsubscribed.');
        this.isSubscribed = false;

        this.updateBtn();
      }.bind(this));
    },
    updateSubscriptionOnServer: function(subscription) {
      if (subscription) {
        console.log( subscription )
        console.log( JSON.stringify(subscription) )
      } else {
        console.log('nothing');
      }
    },
    onSetBellClick: function() {
      if (this.isSubscribed) {
        this.unsubscribeUser();
      } else {
        this.subscribeUser();
      }
    },
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
      this.mapService.cursorMode = "SCOUT"
      
      if (this.mapService.markerController.myScoutMarker != null) {
        this.mapService.map.panTo(this.mapService.markerController.myScoutMarker.position)
      }
      else {
        const uid = this.mapService.markerController.uid
        const data = {
          uid: uid,
          position: {
            lat: this.mapService.markerController.myUserMarker.position.lat(),
            lng: this.mapService.markerController.myUserMarker.position.lng()
          }
        }
        this.mapService.markerController.createScout(uid, data)
      }
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

  .btn-bell,
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
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    font-size: 0;
    color: #666;
    width: 40px;
    height: 40px;
    z-index: 1;
    background-size: 80% 80%;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .btn-logout {
    top: 0;
    left: 0;
    font-size: 10px;
    color: white;
    background-color: #333;
  }

  .btn-bell {
    top: 45px;
    left: 0px;
    bottom: auto;
    right: auto;
    z-index: 1;
    background-size: 60% 60%;
    background-color: #333;
  }

  .btn-user {
    top: 0;
    right: 0;
  }

  .btn-scout {
    top: 45px;
    right: 0;
  }

  .btn-ward {
    bottom: 90px;
    right: 0px;
  }


  .btn-default {
    bottom: 0px;
    right: 50px;
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
