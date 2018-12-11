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
      <button  v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user" v-if="markerController.myUserMarker">
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
          Owner: {{ (typeof markerController.userMarkers[markerController.stores[markerController.store].owner] != 'undefined') ? markerController.userMarkers[markerController.stores[markerController.store].owner]['username'] : 'you'  }}
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
import firebase from 'firebase'
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
      markerController: new MarkerController(firebase.auth().currentUser.uid),
      isWalking: null,
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

    window.addEventListener('map_discover', function(e) {
      this.markerController.discover()
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
    onPan() {
      if (this.markerController.myUserMarker && this.markerController.myScout) {
        this.markerController.discover()
      }
    },
    onMapClick(e) {
      this.markerController.myScout.marker.setAnimation(null)

      if (e.placeId) {
        e.stop()

        const visibility = this.markerController.gridService.setGrid(this.markerController.myUserMarker, this.markerController.myScout.marker, this.markerController.myWardMarkers)
        const visible = new google.maps.Polygon({paths: visibility})
        const isHidden = google.maps.geometry.poly.containsLocation(e.latLng, visible)

        if (!isHidden) {
          this.markerController.getPlaceDetails(e)
          this.cursorMode = null
        }
      }

      switch(this.cursorMode) {
        case "WARD":
          const position = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
          this.markerController.createWard({
            position: position,
            id: this.markerController.createMarkerId(position)
          })

          break
        case "SCOUT":
          this.markerController.moveScout(e.latLng)
          this.cursorMode = null

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
      }

      if (item.id === 'gold') {
        this.cursorMode = "GOLD"

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
      this.map.panTo(this.markerController.myUserMarker.position)
    },
    onPanScoutClick() {
  		if (this.markerController.myScout == null) {
  			this.markerController.createScout(this.uid, {
  				uid: this.uid,
  				position: {
  					lat: this.markerController.myUserMarker.position.lat(),
  					lng: this.markerController.myUserMarker.position.lng()
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
