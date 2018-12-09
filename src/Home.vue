<template>
  <section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <button v-on:click="onSignalClick" :class="geoService.signal">
    </button>
    <button  v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user" v-if="mapController.markerController.myUserMarker">
      {{mapController.markerController.myUserMarker.username}}
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn btn-scout">
      Scout
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + ( (ui.dialogs.inventory) ? assets.inventoryOpen : assets.inventory )+ ')' }" v-on:click="onInventoryClick" class="btn btn-inventory">
      Inventory
    </button>
    <button class="btn btn-logout" v-on:click="logout">
      EXIT
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.bell + ')', backgroundColor: (isSubscribed) ? '#63EE23' : '#FF6B6B' }" v-on:click="onSetBellClick" class="btn btn-bell" v-if="pushEnabled">
      PUSH
    </button>
    <button class="btn btn-stop" v-on:click="onStopClick" v-if="this.mapController.markerController.isWalking">
      Stop
    </button>

    <div class="dialog dialog--shop" v-if="mapController.shop">
      <header>
        <h2>{{ mapController.shop.name }}</h2>
        <span>{{ mapController.shop.category }}</span>
        <button v-on:click="mapController.shop = null">Close</button>
      </header>

      <button v-for="item in mapController.shop.items" v-bind:style="{ backgroundImage: 'url(' + assets[item.image] + ')' }" v-on:click="onGetItemClick(mapController.shop.id, item)" class="btn btn-gold">
        {{ item.name }}
        <small>
          {{ item.amount }}
        </small>
      </button>
      <!-- <button v-bind:style="{ backgroundImage: 'url(' + assets.gold + ')' }" v-on:click="onSpawnWardClick" class="btn btn-gold">
        Gold

      </button> -->
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
    </div>

    <div class="dialog dialog--inventory" v-if="ui.dialogs.inventory">
      <button v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onSpawnWardClick" class="btn btn-ward">
        Ward
        <small>
          {{ 5 - mapController.markerController.numOfWards }}
        </small>
      </button>
      <button v-bind:style="{ backgroundImage: 'url(' + assets.gold + ')' }" v-on:click="onSpawnWardClick" class="btn btn-gold">
        Gold
        <small>
          {{ mapController.markerController.numOfGold }}
        </small>
      </button>
      <button class="btn btn-disabled"></button>
      <button class="btn btn-disabled"></button>
    </div>

  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import GeoService from './services/GeoService';
import MapController from './controllers/MapController';

import KnightImg from './assets/img/knight-1.png'
import ArcherImg from './assets/img/archer-1.png'
import WolfImg from './assets/img/wolf-1.png'
import WardImg from './assets/img/ward-1.png'
import GoldImg from './assets/img/coin.png'
import BellImg from './assets/img/badge.png'
import InventoryImg from './assets/img/backpack.png'
import InventoryOpenImg from './assets/img/backpack_open.png'

export default {
  name: 'home',
  data () {
    return {
      ui: {
        dialogs: {
          inventory: false,
          shop: true
        }
      },
      isSubscribed: false,
      assets: {
        ward: WardImg,
        knight: KnightImg,
        scout: WolfImg,
        archer: ArcherImg,
        bell: BellImg,
        gold: GoldImg,
        inventory: InventoryImg,
        inventoryOpen: InventoryOpenImg
      },
      uid: firebase.auth().currentUser.uid,
      geoService: new GeoService,
      mapController: new MapController,
      isWalking: null,
      userClass: null,
      pushEnabled: false
    }
  },
  mounted() {
    this.mapController.init();

    window.swRegistration = null;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');

      this.pushEnabled = true

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
  },
  methods: {
    onGetItemClick(id, item) {
      this.mapController.markerController.numOfGold += item.amount
      this.mapController.markerController.updateShop({
        id: id,
        amount: 0
      })

      this.mapController.markerController.shop = null
    },
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
      window.dispatchEvent(new CustomEvent('cursor_changed', { detail: "WARD" }))
    },
    onStopClick: function() {
      this.mapController.markerController.myScout.stop()
    },
    onSignalClick: function() {
      this.geoService.watchPosition()
    },
    onPanUserClick: function() {
      this.mapController.map.panTo(this.mapController.markerController.myUserMarker.position)
    },
    onPanScoutClick: function() {
      this.mapController.cursorMode = "SCOUT"

      if (this.mapController.markerController.myScout != null) {
        this.mapController.map.panTo(this.mapController.markerController.myScout.marker.position)
      }
      else {
        const uid = this.mapController.markerController.uid
        const data = {
          uid: uid,
          position: {
            lat: this.mapController.markerController.myUserMarker.position.lat(),
            lng: this.mapController.markerController.myUserMarker.position.lng()
          }
        }
        this.mapController.markerController.createScout(uid, data)
      }
    },
    onInventoryClick: function() {
      this.ui.dialogs.inventory = !this.ui.dialogs.inventory
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

  .btn {
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

  .btn:focus {
    outline: none;
  }

  .btn:active {
    opacity: 0.8
  }

  .btn small {
    position: absolute;
    z-index: 1;
    right: 0;
    bottom: 0;
    background: #333;
    color: white;
    font-size: 7px;
    padding: 2px;
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

  .btn-inventory {
    bottom: 95px;
    right: 0px;
    background-size: 90% 90%;
  }

  .btn-stop {
    bottom: 0px;
    right: 50px;
  }

  .btn-stop:before {
    content: "";
    display: inline-block;
    background: #666;
    width: 14px;
    height: 14px;
    position: relative;
  }

  .dialog {
    border-radius: 2px;
    position: fixed;
    margin: auto;
    display: block;
    background: rgba(0,0,0,0.4);
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
  }

  .dialog--shop {
    top: 50%;
    left: 50%;
    width: 250px;
    height: 100px;
    margin-left: -125px;
    margin-top: -50px;
  }

  .dialog--shop header {
    position: absolute;
    background: black;
    top: -40px;
    left: 0;
    color: white;
    padding: 5px 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    font-size: 10px;
    width: calc(100% - 20px) ;
    margin: 0;
  }

  .dialog--shop header button {
    background: transparent;
    position: absolute;
    right: 10px;
    top: 10px;
    height: 15px;
    width: 15px;
    font-size: 0;
    border: 0;
    transform: rotate(45deg)
  }

  .dialog--shop header button:before,
  .dialog--shop header button:after {
    content: "";
    display: block;
    width: 15px;
    height: 3px;
    background: #EFEFEF;
    position: absolute;
    left: 0;
  }

  .dialog--shop header button:after {
    left: 0;
    transform: rotate(-90deg);
  }

  .dialog--shop h2 {
    margin: 0;
    text-transform: uppercase;
    font-size: 12px;
    width: 180px;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dialog--inventory {
    width: 50px;
    height: 210px;
    bottom: 155px;
    right: 0;
  }

  .dialog .btn {
    flex: 0 auto;
    position: relative;
    margin: 5px;
  }

  .btn-disabled {
    background-color: rgba(0,0,0,0.5);
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
