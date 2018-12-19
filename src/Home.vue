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
      <button  v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user" v-if="markerController.myUser">
        User
      </button>
      <button v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn btn-scout">
        Scout
      </button>
      <button v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onPanWardClick" class="btn btn-ward">
        Ward
      </button>
    </div>

    <button v-bind:style="{ backgroundImage: 'url(' + ( (ui.dialogs.inventory) ? assets.inventoryOpen : assets.inventory )+ ')' }" v-on:click="onInventoryClick" class="btn btn-inventory">
      Inventory
    </button>
    <button class="btn btn-stop" v-on:click="onStopClick" v-if="markerController.isWalking">
      Stop
    </button>
    <div class="dialog dialog--store" v-if="markerController.store">
      <header>
        <h2>{{ markerController.stores[markerController.store].name }}</h2>
        <div>
          Category: {{ markerController.stores[markerController.store].category }}
        </div>
        <div>
          Owner: {{ (typeof markerController.users[markerController.stores[markerController.store].owner] != 'undefined') ? markerController.users[markerController.stores[markerController.store].owner]['username'] : 'you'  }}
        </div>
        <button v-on:click="onCloseStore">Close</button>
      </header>

      <ul>
        <li v-for="(item, key) in markerController.stores[markerController.store].items">
          <button
            :key="key"
            v-if="item"
            v-bind:style="{ backgroundImage: 'url(' + assets[item.id] + ')' }"
            v-bind:class="`btn ${item.class}`"
            v-on:click="onGetItemFromStore(markerController.store, key, item)">
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
      </ul>
    </div>

    <div class="dialog dialog--inventory" v-if="itemController.inventoryOpen">
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
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import config from './config.js'

// Import controllers
import MapController from './controllers/MapController'
import ItemController from './controllers/ItemController'
import NotificationController from './controllers/NotificationController'
import MarkerController from './controllers/MarkerController'

// Import services
import GeoService from './services/GeoService'

// Import assets
import KnightImg from './assets/img/knight-1.png'
import ArcherImg from './assets/img/archer-1.png'
import WolfImg from './assets/img/wolf-0.png'
import WardImg from './assets/img/ward-1.png'
import GoldImg from './assets/img/coin.png'
import WoodSwordImg from './assets/img/woodSword.png'
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
        sword: WoodSwordImg,
        inventory: InventoryImg,
        inventoryOpen: InventoryOpenImg
      },
      uid: firebase.auth().currentUser.uid,
      geoService: new GeoService,
      mapController: new MapController,
      itemController: new ItemController(firebase.auth().currentUser.uid),
      notificationController: new NotificationController,
      markerController: new MarkerController(firebase.auth().currentUser.uid),
      userClass: null,
      wardId: 0
    }
  },
  mounted() {
    // Initialize the map
    this.mapController.init().then(function(map) {
      this.map = map

      this.markerController.init(this.map)

      this.map.addListener('click', function(e) {
        this.onMapClick(e);
      }.bind(this))

      // this.map.addListener('bounds_changed', function(e) {
      //   this.onPan()
      // }.bind(this))

    }.bind(this)).catch(function(err) {
      console.log(err)
    });

    // Add custom event listeners
    window.addEventListener('cursor_changed', function(e) {
      this.cursorMode = e.detail.type
    }.bind(this))

    // Start the service worker if available
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
    onFight() {
      alert(`Wooden Sword: "We'll be fightin those goblins very soon..."`);
    },
    onPan() {
      if (this.markerController.myUser && this.markerController.myScout) {
        this.markerController.discover()
      }
    },
    onMapClick(e) {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }

      if (e.placeId) {
        e.stop()

        const visibility = this.markerController.gridService.setGrid(this.markerController.myUser.marker, this.markerController.myScout.marker, this.markerController.myWardMarkers)
        const visible = new google.maps.Polygon({paths: visibility})
        const isHidden = google.maps.geometry.poly.containsLocation(e.latLng, visible)

        if (!isHidden) {
          this.markerController.getPlaceDetails(e)
          this.cursorMode = null
        }
      }

      switch(this.cursorMode) {
        case "WARD":
          this.markerController.createWard({
            position: position,
            id: this.markerController.createMarkerId(position)
          })
          break
        case "GOLD":
          this.markerController.createGold({
            uid: this.uid,
            position: position,
            id: this.markerController.createMarkerId(position),
            amount: this.amountToDrop
          })
          break
        case "SCOUT":
          this.markerController.moveScout(e.latLng)
          break
      }
    },
    onInventoryClick() {
      this.itemController.inventoryOpen = !this.itemController.inventoryOpen

      if (!this.itemController.inventoryOpen) {
        this.mapController.cursorMode = null
      }
    },
    onGetItemFromStore(id, key, item) {
      const storesRef = this.markerController.storesRef

      this.itemController.inventoryOpen = true

      if (item.amount > 0) {
        var inventory = this.itemController.add(item)
        this.itemController.update(inventory)
      }

      storesRef.child(id).child('items').child(key).update({ amount: 0 })
    },
    onCloseStore() {
      this.markerController.store = null
    },
    onItemClick(item) {
      return this[item.callback](item);
    },
    onDropItem(item) {
      if (item.id === 'ward') {
        this.cursorMode = "WARD"
        this.amountToDrop = 1
      }

      if (item.id === 'gold') {
        this.cursorMode = "GOLD"
        this.amountToDrop = item.amount
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
      this.markerController.myScout.stop()
    },
    onSignalClick() {
      this.geoService.getPosition().then(function(r) {
        this.map.panTo(r)
        this.geoService.watchPosition()
      }.bind(this)).catch(function(err) {
        console.log(err)
      })
    },
    onPanWardClick() {
      const wardMarkers = this.markerController.myWardMarkers

      if (wardMarkers.length > 0) {
        this.map.panTo(wardMarkers[Object.keys(wardMarkers)[0]].position);
      }
    },
    onPanUserClick() {
      this.map.panTo(this.markerController.myUser.marker.position)
    },
    onPanScoutClick() {
  		if (this.markerController.myScout == null) {
  			this.markerController.createScout(this.uid, {
  				uid: this.uid,
  				position: {
  					lat: this.markerController.myUser.marker.position.lat(),
  					lng: this.markerController.myUser.marker.position.lng()
  				}
  			})
  		}
      else {
        this.map.panTo(this.markerController.myScout.marker.position)
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

<style scoped lang="scss">
  @import './app.scss'
</style>
