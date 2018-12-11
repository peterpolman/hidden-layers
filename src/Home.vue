<template>
  <section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <button class="btn btn-logout" v-on:click="logout">
      EXIT
    </button>
    <button v-bind:style="{ backgroundImage: 'url(' + assets.bell + ')', backgroundColor: (notificationController.isSubscribed) ? '#63EE23' : '#FF6B6B' }" v-on:click="onSetBellClick" class="btn btn-bell" v-if="notificationController.pushEnabled">
      PUSH
    </button>
    <button v-on:click="onSignalClick" :class="geoService.signal">

    </button>

    <div class="section-pan">
      <button  v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user" v-if="mapController.markerController.myUserMarker">
        User
      </button>
      <button v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn btn-scout">
        Scout
      </button>
      <button v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onPanWardClick" class="btn btn-ward" v-if="mapController.markerController.myWardMarkers">
        Ward
      </button>
    </div>

    <button v-bind:style="{ backgroundImage: 'url(' + ( (ui.dialogs.inventory) ? assets.inventoryOpen : assets.inventory )+ ')' }" v-on:click="onInventoryClick" class="btn btn-inventory">
      Inventory
    </button>
    <button class="btn btn-stop" v-on:click="onStopClick" v-if="this.mapController.markerController.isWalking">
      Stop
    </button>

    <div class="dialog dialog--store" v-if="mapController.store">
      <header>
        <h2>{{ mapController.markerController.stores[mapController.store].name }}</h2>
        <div>
          Category: {{ mapController.markerController.stores[mapController.store].category }}
        </div>
        <div>
          Owner: {{ (typeof mapController.markerController.userMarkers[mapController.markerController.stores[mapController.store].owner] != 'undefined') ? mapController.markerController.userMarkers[mapController.markerController.stores[mapController.store].owner]['username'] : 'you'  }}
        </div>
        <button v-on:click="onCloseStore">Close</button>
      </header>

      <ul>
        <li v-for="(item, key) in mapController.markerController.stores[mapController.store].items">
          <button
            :key="key"
            v-if="item"
            v-bind:style="{ backgroundImage: 'url(' + assets[item.id] + ')' }"
            v-bind:class="`btn ${item.class}`"
            v-on:click="onGetItemFromStore(mapController.store, key, item)">
            {{ item.name }}
            <small>
              {{ item.amount }}
            </small>
           </button>
         </li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>

    <div class="dialog dialog--inventory" v-if="this.itemController.inventoryOpen">
      <ul>
        <li v-for="item in itemController.inventory">
          <button
            :key="item.id"
            v-if="item"
            v-bind:style="{ backgroundImage: 'url(' + assets[item.id] + ')' }"
            v-bind:class="`btn ${item.class}`"
            v-on:click="onItemClick(item)">
            {{ item.name }}
            <small v-if="item.amount">
              {{ item.amount }}
            </small>
           </button>
         </li>
       </ul>
    </div>
  </section>
</template>

<script>
import firebase from 'firebase';
import config from './config.js';

import draggable from 'vuedraggable'

import GeoService from './services/GeoService';
import MapController from './controllers/MapController';
import ItemController from './controllers/ItemController';
import NotificationController from './controllers/NotificationController';

import KnightImg from './assets/img/knight-1.png'
import ArcherImg from './assets/img/archer-1.png'
import WolfImg from './assets/img/wolf-1.png'
import WardImg from './assets/img/ward-1.png'
import GoldImg from './assets/img/coin.png'
import BellImg from './assets/img/badge.png'
import InventoryImg from './assets/img/backpack.png'
import InventoryOpenImg from './assets/img/backpack_open.png'

export default {
  components: {
      draggable,
  },
  name: 'home',
  data () {
    return {
      ui: {
        dialogs: {
          inventory: false,
          store: true
        }
      },
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
      itemController: new ItemController(firebase.auth().currentUser.uid),
      notificationController: new NotificationController,
      isWalking: null,
      userClass: null,
      wardId: 0
    }
  },
  mounted() {
    this.mapController.init();

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.notificationController.pushEnabled = true

      navigator.serviceWorker.register('sw.js')
      .then(function(swReg) {
        window.swRegistration = swReg;
      }.bind(this))
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    } else {
      console.warn('Push messaging is not supported');
    }

  },
  methods: {
    onInventoryClick() {
      this.itemController.inventoryOpen = !this.itemController.inventoryOpen

      if (!this.itemController.inventoryOpen) {
        this.mapController.cursorMode = null
      }
    },
    onGetItemFromStore(id, key, item) {
      const storesRef = this.mapController.markerController.storesRef

      this.itemController.inventoryOpen = true

      if (item.amount > 0) {
        var inventory = this.itemController.add(item)
        this.itemController.update(inventory)
      }

      storesRef.child(id).child('items').child(key).update({ amount: 0 })
    },
    onCloseStore() {
      this.mapController.store = null
    },
    onItemClick(item) {
      return this[item.callback](item);
    },
    onDropItem(item) {
      if (item.id === 'ward') {
        this.mapController.cursorMode = "WARD"
      }

      if (item.id === 'gold') {
        alert('Count them moneyzz!');
      }
    },
    onSetBellClick() {
      if (this.notificationController.isSubscribed) {
        this.notificationController.unsubscribeUser();
      } else {
        this.notificationController.subscribeUser();
      }
    },
    onSpawnWardClick() {
      window.dispatchEvent(new CustomEvent('cursor_changed', { detail: { type: "WARD" } }))
    },
    onStopClick() {
      this.mapController.markerController.myScout.stop()
    },
    onSignalClick() {
      this.geoService.getPosition().then(function(r) {
        this.mapController.map.panTo(r)
        this.geoService.watchPosition()
      }.bind(this)).catch(function(err) {
        console.log(err)
      })
    },
    onPanWardClick() {
      const wardMarkers = this.mapController.markerController.myWardMarkers
      this.mapController.map.panTo(wardMarkers[Object.keys(wardMarkers)[0]].position);
    },
    onPanUserClick() {
      this.mapController.map.panTo(this.mapController.markerController.myUserMarker.position)
    },
    onPanScoutClick() {
      if (this.mapController.markerController.myScout != null) {
        this.mapController.map.panTo(this.mapController.markerController.myScout.marker.position)
      }
      // Deploy a new scout if there is none
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
    logout() {
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
    box-shadow: 0 0 5px 2px #3D91CB;
  }

  .btn:active {
    opacity: 0.8
  }

  .btn small {
    position: absolute;
    z-index: 1;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.75);
    color: white;
    font-size: 7px;
    padding: 2px 3px;
    border-top-left-radius: 2px;
  }

  .btn-gold {
    background-size: 50% 50%;
  }

  .section-pan .btn-ward {
    top: 90px;
    right: 0;
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
    padding: 5px;
  }

  .dialog ul {
    margin: 0;
    list-style: none;
    padding: 0;
    display: flex;
    width: 100%;
    height: 100%;
    flex-wrap: wrap;
    display: flex;
    flex-wrap: wrap;
  }

  .dialog li {
    margin: 5px;
    border-radius: 2px;
    width: 40px;
    height: 40px;
    background-color: rgba(0,0,0,0.5);
    display: block;
  }

  .dialog--store {
    bottom: 155px;
    right: 70px;
    width: 150px;
    height: 210px;
  }

  .dialog--store header {
    position: absolute;
    background: black;
    top: -52px;
    max-height: 52px;
    box-sizing: border-box;
    left: 0;
    color: white;
    padding: 5px 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    font-size: 10px;
    width: 100%;
    margin: 0;
  }

  .dialog--store header button {
    background: transparent;
    position: absolute;
    right: 5px;
    top: 5px;
    height: 15px;
    width: 15px;
    font-size: 0;
    border: 0;
    transform: rotate(45deg)
  }

  .dialog--store header button:before,
  .dialog--store header button:after {
    content: "";
    display: block;
    width: 15px;
    height: 3px;
    background: #EFEFEF;
    position: absolute;
    left: 0;
  }

  .dialog--store header button:after {
    left: 0;
    transform: rotate(-90deg);
  }

  .dialog--store h2 {
    margin: 0;
    text-transform: uppercase;
    font-size: 12px;
    width: 125px;
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

  .dialog--inventory ul {
    flex-direction: column;
  }

  .dialog .btn {
    flex: 0 auto;
    position: relative;
    margin: 0px;
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
