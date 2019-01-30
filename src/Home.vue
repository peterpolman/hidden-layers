<template>
<section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <div class="messages" v-if="messageController && userController">
        <div v-for="message of messageController.messages" :key="message.key">
            <span>[{{ messageController.getDateTime(message.timestamp) }}]</span>
            <strong v-if="userController.userNames[message.uid]">{{ userController.userNames[message.uid] }}:</strong>
            <span>{{ message.message }}</span>
        </div>
    </div>

    <button class="btn btn-logout" v-on:click="logout">
        EXIT
    </button>
    <button v-if="userController && userController.myUser" v-on:click="onSignalClick" :class="geoService.signal">

    </button>

    <div class="section-pan">
        <button v-if="userController && userController.myUser" v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn btn-user">
            User
        </button>
        <button v-if="scoutController" v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn btn-scout">
            Scout
        </button>
        <button v-if="lootController && lootController.myWards.length" v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onPanWardClick" class="btn btn-ward">
            Ward
        </button>
    </div>

    <button v-if="itemController && itemController.inventory" v-bind:style="{ backgroundImage: 'url(' + ( (ui.dialogs.inventory) ? assets.inventoryOpen : assets.inventory )+ ')' }" v-on:click="onInventoryClick" class="btn btn-inventory">
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
                    <small v-if="(item.amount > 1)">
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
                potion: require('./assets/img/potion.png'),
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
            lootController: null,
            messageController: null
        }
    },
    mounted() {
        this.mapService.init().then((map) => {
            const uid = firebase.auth().currentUser.uid
            const usersRef = firebase.database().ref('users')
            const scoutsRef = firebase.database().ref('scouts')
            const lootRef = firebase.database().ref('loot')

            // These controllers should be created when the map is loaded.
            this.messageController = new MessageController()
            this.userController = new UserController(uid)
            this.scoutController = new ScoutController(uid)
            this.lootController = new LootController(uid)
            this.storeController = new StoreController()
            this.itemController = new ItemController()

            this.scoutController.userNames = this.userController.userNames

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

            window.addEventListener('user.click', (data) => {
                this.onUserClick(data.detail)
            })

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
                wards: this.lootController.myWards
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
        onUserClick(uid) {
            switch (this.cursorMode) {
                case 'potion':
                    if (this.selectedItem) {
                        this.itemController.substract(this.selectedItem, 1)
                        this.userController.updateUser(uid, {
                            mode: "HEALING",
                            hitPoints: 100,
                            healer: this.uid
                        })
                        this.selectedItem = null
                        this.cursorMode = null
                    }
                    break
                case 'sword':
                    if (this.uid != uid) {
                        const damage = Math.floor(Math.random() * 10)

                        this.userController.updateUser(uid, {
                            mode: 'FIGHTING',
            				hitDmg: damage,
            				attacker: this.uid,
            				hitPoints: this.userController.users[uid].hitPoints - damage
                        })
                    }
                    break
                default:
                    if (this.uid != uid) {
                        this.setMessage(`Hi ${this.userController.userNames[uid]}!`)
                    }

                    break
            }
        },
        onMapClick(e) {
            let item
            const visibility = {
                user: this.userController.myUser,
                scout: this.scoutController.myScout,
                wards: this.lootController.myWards
            }
            const isHidden = this.mapService.isPositionHidden(e.latLng, visibility)
            const position = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            }

            if (this.selectedItem) {
                item = {
                    uid: this.uid,
                    id: this.createMarkerId(position),
                    slug: this.selectedItem.slug,
                    name: this.selectedItem.name,
                    position: position,
                    size: this.selectedItem.size,
                    amount: this.selectedItem.amount,
                }
            }

            if (e.placeId) {
                if (!isHidden) {
                    this.storeController.getPlaceDetails(e)
                    this.cursorMode = null
                }
                e.stop()
            }

            switch (this.cursorMode) {
                case "scout":
                    this.scoutController.moveScout(e.latLng)
                    break
                case "ward":
                    if (!isHidden && this.selectedItem) {
                        this.itemController.substract(this.selectedItem, 1)
                        this.lootController.drop(item, 1)
                        this.selectedItem = null
                        this.cursorMode = null
                    }
                    break
                default :
                    if (!isHidden && this.selectedItem) {
                        this.itemController.substractAll(this.selectedItem)
                        this.lootController.dropAll(item)
                        this.selectedItem = null
                        this.cursorMode = null
                    }
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
            this.setMessage(`Picked up ${item.amount} ${item.name} from store`)
        },
        onCloseStore() {
            this.storeController.store = null
        },
        onItemClick(item) {
            this.selectedItem = item
            this.cursorMode = item.slug
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
            const wards = this.lootController.myWards

            if (wards.length > 0) {
                MAP.panTo(wards[Object.keys(wards)[0]].marker.position);
            }
        },
        onPanUserClick() {
            MAP.panTo(this.userController.myUser.marker.position)
        },
        onPanScoutClick() {
            this.cursorMode = "scout"

            if (this.scoutController.myScout != null) {
                MAP.panTo(this.scoutController.myScout.marker.position)
            } else {
                const data = {
                    uid: this.uid,
                    hp: 100,
                    position: {
                        lat: this.userController.myUser.marker.position.lat(),
                        lng: this.userController.myUser.marker.position.lng()
                    }
                }
                this.scoutController.createScout(this.uid, data)
            }
        },
        setMessage(message) {
            window.dispatchEvent(new CustomEvent('message_add', {
                detail: {
                    uid: this.uid,
                    message: message,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }
            }))
        },
        createMarkerId(latLng) {
            const id = (latLng.lat + "_" + latLng.lng)
            return id.replace(/\./g, '')
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
