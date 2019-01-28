<template>
<section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <div class="messages" v-if="messageController">
        <div v-for="message of messageController.messages" :key="message.key">
            <span>[{{ messageController.getDateTime(message.timestamp) }}]</span>
            <strong v-if="userController.userNames[message.uid]">{{ userController.userNames[message.uid] }}:</strong>
            <span>{{ message.message }}</span>
        </div>
    </div>

    <button class="btn btn-logout" v-on:click="logout">
        EXIT
    </button>
    <button v-on:click="onSignalClick" :class="geoService.signal">

    </button>

    <div class="section-pan">
        <button v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user">
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
    <button class="btn btn-stop" v-on:click="onStopClick" v-if="scoutController && scoutController.isWalking">
        Stop
    </button>
    <div class="dialog dialog--store" v-if="storeController && storeController.store">
        <header>
            <h2>{{ storeController.stores[storeController.store].name }}</h2>
            <div>
                Category: {{ storeController.stores[storeController.store].category }}<br>
                Owner: {{ userController.userNames[storeController.stores[storeController.store].owner]  }}
            </div>
            <button v-on:click="onCloseStore">Close</button>
        </header>

        <ul>
            <li :key="item.slug"
                v-if="(item.amount > 0)"
                v-for="item in storeController.stores[storeController.store].items">
                <button
                    v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }"
                    v-bind:class="`btn btn-${item.slug}`"
                    v-on:click="onGetItemFromStore(storeController.store, item)
                    ">
                    {{ item.name }}
                    <small>
                        {{ item.amount }}
                    </small>
                </button>
            </li>
        </ul>
    </div>

    <div class="dialog dialog--inventory" v-if="itemController && itemController.inventoryOpen">
        <ul>
            <li :key="item.slug"
                v-if="(item.amount > 0)"
                v-for="item in itemController.inventory">
                <button
                    v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }"
                    v-bind:class="`btn btn-${item.slug}`"
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
import 'firebase/functions';

import config from './config.js'

// Import services
import MapService from './services/MapService'
import GeoService from './services/GeoService'

// Import controllers
import UserController from './controllers/UserController'
import ScoutController from './controllers/ScoutController'
import StoreController from './controllers/StoreController'
import ItemController from './controllers/ItemController'
import MessageController from './controllers/MessageController'
import LootController from './controllers/LootController'

export default {
    name: 'home',
    data() {
        return {
            ui: {
                dialogs: {
                    inventory: false,
                    store: true
                }
            },
            assets: {
                ward: require('./assets/img/ward-1.png'),
                knight: require('./assets/img/knight-1.png'),
                archer: require('./assets/img/archer-1.png'),
                scout: require('./assets/img/wolf-0.png'),
                gold: require('./assets/img/coin.png'),
                sword: require('./assets/img/woodSword.png'),
                inventory: require('./assets/img/backpack.png'),
                inventoryOpen: require('./assets/img/backpack_open.png'),
                discover: require('./assets/img/discover.png')
            },
            userClass: null,
            wardId: 0,
            users: [],
            scouts: [],
            messages: [],
            selectedStore: {},
            uid: firebase.auth().currentUser.uid,
            mapService: new MapService(),
            geoService: new GeoService(),
            userController: null,
            scoutController: null,
            storeController: null,
            itemController: null,
            messageController: new MessageController()
        }
    },
    mounted() {
        this.mapService.init().then((map) => {
            const uid = firebase.auth().currentUser.uid
            const usersRef = firebase.database().ref('users')
            const scoutsRef = firebase.database().ref('scouts')
            const lootRef = firebase.database().ref('loot')

            // These controllers should be created when the map is loaded.
            this.userController = new UserController(uid)
            this.scoutController = new ScoutController(uid)
            this.lootController = new LootController(uid)
            this.storeController = new StoreController()
            this.itemController = new ItemController()

            MAP.addListener('click', (e) => {
                this.onMapClick(e);
            })

            window.addEventListener('cursor_changed', (e) => {
                this.cursorMode = e.detail.type
            })

            scoutsRef.on('child_added', (snap) => this.discover() )
            scoutsRef.on('child_changed', (snap) => this.discover() )
            scoutsRef.on('child_removed', (snap) => this.discover() )
            usersRef.on('child_changed', (snap) => this.discover() )
            lootRef.on('child_added', (snap) => this.discover() )
            lootRef.on('child_changed', (snap) => this.discover() )
            lootRef.on('child_removed', (snap) => this.discover() )
        }).then(() => {
            this.discover()
        }).catch((err) => {
            console.log(err)
        })
    },
    methods: {
    	discover() {
            const visibility = {
                user: this.userController.myUser,
                scout: this.scoutController.myScout,
                wards: this.lootController.myWardMarkers
            }

            const positions = {
                users: this.userController.users,
                scouts: this.scoutController.scouts,
                goblins: this.storeController.goblins,
                loot: this.lootController.loot
            }

            const discovered = this.mapService.getVisibleObjects(visibility, positions)

            this.userController.users = discovered.users
            this.scoutController.scouts = discovered.scouts
            this.storeController.goblins = discovered.goblins
            this.lootController.loot = discovered.loot
    	},
        onMapClick(e) {
            const visibility = {
                user: this.userController.myUser,
                scout: this.scoutController.myScout,
                wards: this.lootController.myWardMarkers
            }

            const isHidden = this.mapService.isPositionHidden(e.latLng, visibility)

            if (e.placeId) {
                if (!isHidden) {
                    this.storeController.getPlaceDetails(e)
                    this.cursorMode = null
                }
                e.stop()
            }

            switch (this.cursorMode) {
                case "LOOT":
                    if (!isHidden) {
                        const position = {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                        }
                        const data = {
                            uid: this.uid,
                            id: this.lootController.createMarkerId(position),
                            slug: this.itemToDrop.slug,
                            name: this.itemToDrop.name,
                            position: position,
                            size: this.itemToDrop.size,
                            amount: this.itemToDrop.amount,
                        }
                        this.lootController.drop(data)
                        console.log(this.lootController.myWardMarkers)

                    }
                    break
                case "SCOUT":
                    this.scoutController.moveScout(e.latLng)
                    break
            }
        },
        onInventoryClick() {
            this.itemController.inventoryOpen = !this.itemController.inventoryOpen

            if (!this.itemController.inventoryOpen) {
                this.cursorMode = null
            }
        },
        onGetItemFromStore(id, item) {
            this.itemController.inventoryOpen = true
            this.itemController.add(item)
            this.storeController.storesRef.child(id).child('items').child(item.slug).remove()
            this.sendMessage(`Got ${item.amount} ${item.name} from store`)
        },
        sendMessage(message) {
            window.dispatchEvent(new CustomEvent('message_add', {
                detail: {
                    uid: this.uid,
                    message: message,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }
            }))
        },
        onCloseStore() {
            this.storeController.store = null
        },
        onItemClick(item) {
            this.cursorMode = "LOOT"
            this.itemToDrop = item
        },
        onStopClick() {
            this.scoutController.myScout.setMode("STANDING")
        },
        onSignalClick() {
            this.geoService.getPosition().then(function(r) {
                MAP.panTo(r)
                this.geoService.watchPosition()
            }.bind(this)).catch(function(err) {
                console.log(err)
            })
        },
        onPanWardClick() {
            const wardMarkers = this.lootController.myWardMarkers

            if (wardMarkers.length > 0) {
                MAP.panTo(wardMarkers[Object.keys(wardMarkers)[0]].position);
            }
        },
        onPanUserClick() {
            MAP.panTo(this.userController.myUser.marker.position)
        },
        onPanScoutClick() {
            if (this.scoutController.myScout == null) {
                this.scoutController.createScout(this.uid, {
                    uid: this.uid,
                    hp: 100,
                    position: {
                        lat: this.userController.myUser.marker.position.lat(),
                        lng: this.userController.myUser.marker.position.lng()
                    }
                })
            } else {
                MAP.panTo(this.scoutController.myScout.marker.position)
                this.cursorMode = "SCOUT"
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
