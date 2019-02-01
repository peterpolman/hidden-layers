<template>
<section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <Messages ref="messages" />

    <section class="section-settings">
        <button class="btn btn-logout" v-on:click="logout">
            EXIT
        </button>
        <button
            :class="`btn btn-geo ${geoService.signal}`"
            v-if="userController && userController.myUser"
            v-on:click="onSignalClick">
            <span></span>
        </button>
    </section>

    <section class="section-pan">
        <button v-if="userController && userController.myUser" v-bind:style="{ backgroundImage: 'url(' + assets.knight + ')' }" v-on:click="onPanUserClick" class="btn">
            User
        </button>
        <button v-if="scoutController" v-bind:style="{ backgroundImage: 'url(' + assets.scout + ')' }" v-on:click="onPanScoutClick" class="btn">
            Scout
        </button>
        <button v-if="lootController && lootController.myWards.length" v-bind:style="{ backgroundImage: 'url(' + assets.ward + ')' }" v-on:click="onPanWardClick" class="btn">
            Ward
        </button>
    </section>

    <button class="btn btn-stop" v-on:click="onStopClick" v-if="scoutController && scoutController.isWalking">
        Stop
    </button>

    <section class="dialog dialog--store" v-if="storeController && storeController.store">
        <header>
            <h2>{{ storeController.stores[storeController.store].name }}</h2>
            <div>
                Category: {{ storeController.stores[storeController.store].category }}<br>
                Owner: {{ userController.userNames[storeController.stores[storeController.store].owner]  }}
            </div>
            <button v-on:click="onCloseStore">Close</button>
        </header>

        <ul>
            <li :key="item.slug" v-if="(item.amount > 0)" v-for="item in storeController.stores[storeController.store].items">
                <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onGetItemFromStore(storeController.store, item)">
                    {{ item.name }}
                    <small>
                        {{ item.amount }}
                    </small>
                </button>
            </li>
        </ul>
    </section>

    <Equipment ref="equipment" />

    <Inventory ref="inventory" />

</section>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import config from './config.js'

// Components
import Messages from './components/Messages.vue'
import Equipment from './components/Equipment.vue'
import Inventory from './components/Inventory.vue'

// Import services
import MapService from './services/MapService'
import GeoService from './services/GeoService'

// Import controllers
import UserController from './controllers/UserController'
import ScoutController from './controllers/ScoutController'
import StoreController from './controllers/StoreController'
import LootController from './controllers/LootController'

export default {
    name: 'home',
    components: {
        Messages,
        Equipment,
        Inventory,
    },
    data() {
        return {
            assets: {
                ward: require('./assets/img/ward-1.png'),
                knight: require('./assets/img/knight-1.png'),
                archer: require('./assets/img/archer-1.png'),
                scout: require('./assets/img/wolf-0.png'),
                gold: require('./assets/img/coin.png'),
                potion: require('./assets/img/potion.png'),
                sword: require('./assets/img/woodSword.png'),
                discover: require('./assets/img/discover.png')
            },
            userClass: null,
            wardId: 0,
            users: [],
            scouts: [],
            messages: [],
            selectedItem: {},
            selectedStore: {},
            uid: firebase.auth().currentUser.uid,
            watcher: null,
            mapService: new MapService(),
            geoService: new GeoService(),
            userController: null,
            scoutController: null,
            storeController: null,
            lootController: null,
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

            this.scoutController.userNames = this.userController.userNames

            MAP.addListener('click', (e) => {
                this.onMapClick(e);
            })

            window.addEventListener('cursor_changed', (e) => {
                this.cursorMode = e.detail.type
            })

            scoutsRef.on('child_added', (snap) => this.discover())
            scoutsRef.on('child_changed', (snap) => this.discover())
            scoutsRef.on('child_removed', (snap) => this.discover())
            usersRef.on('child_changed', (snap) => this.discover())
            lootRef.on('child_added', (snap) => this.discover())
            lootRef.on('child_changed', (snap) => this.discover())
            lootRef.on('child_removed', (snap) => this.discover())

            window.addEventListener('user.click', (data) => {
                this.onUserClick(data.detail)
            })
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
                // case 'gold':
                //     this.$refs.inventory.itemController.substract(this.selectedItem, 1)
                //     this.$refs.inventory.itemController.give(uid, this.selectedItem, 1)
                //     break;
                case 'potion':
                    if (this.selectedItem) {
                        this.$refs.inventory.itemController.substract(this.selectedItem, 1)

                        if (typeof this.userController.users[uid] != 'undefined') {
                            this.userController.updateUser(uid, {
                                mode: "HEALING",
                                hitPoints: 100,
                                healer: this.uid
                            })
                        }
                        if (typeof this.storeController.goblins[uid] != 'undefined') {
                            const hitPoints = 100
                            const goblin = this.storeController.goblins[uid]

                            goblin.indicator.setMap(MAP)

                            goblin.setHitPoints(hitPoints)
                            goblin.setMessage(null, `${this.userController.userNames[this.uid]} heals an injured Goblin.`)

                            this.storeController.goblins[uid] = goblin
                        }

                        this.selectedItem = null
                        this.cursorMode = null
                    }
                    break
                case 'sword':

                    if (typeof this.storeController.goblins[uid] != 'undefined') {
                        const goblin = this.storeController.goblins[uid]
                        const damage = Math.floor(Math.random() * 10)
                        const hitPoints = (goblin.hitPoints - damage)

                        goblin.indicator.setMap(MAP)

                        if (!goblin.hasTalked) {
                            goblin.talk()
                        }

                        if (damage > 0 && goblin.hitPoints > 0) {
                            goblin.setLabel( damage )
                            goblin.setHitPoints( hitPoints )

                            this.storeController.goblins[uid] = goblin

                            this.setMessage(null, `${this.userController.userNames[this.uid]} hits a Goblin for ${damage} damage.`)
                        }
                        else if (goblin.hitPoints <= 0) {
                            goblin.setMap(null)

                            delete this.storeController.goblins[uid]

                            this.setMessage(null, `${this.userController.userNames[this.uid]} killed a goblin...`)
                        }
                        else {
                            this.setMessage(null, `${this.userController.userNames[this.uid]} failed to hit a Goblin...`)
                        }

                    }

                    if (this.uid != uid && (typeof this.userController.users[uid] != 'undefined')) {
                        const damage = Math.floor(Math.random() * 10)
                        const data = {
                            mode: 'FIGHTING',
                            hitDmg: damage,
                            attacker: this.uid,
                            hitPoints: this.userController.users[uid].hitPoints - damage
                        }

                        if ((data.hitDmg > 0) && (this.userController.users[uid].hitPoints > 0)) {
                            this.setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]} for ${data.hitDmg} damage.`)
                            this.userController.updateUser(uid, data)
                        }
                        else if (this.userController.users[uid].hitPoints <= 0) {
                            this.setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]}'s dead corpse...`)
                        }
                        else {
                            this.setMessage(null, `${this.userController.userNames[data.attacker]} failed to hit ${this.userController.userNames[uid]}...`)
                        }
                    }
                    break
                default:
                    this.$refs.equipment.active = false
                    if (this.uid != uid && (typeof this.userController.users[uid] != 'undefined')) {
                        this.setMessage(this.uid, `Hi ${this.userController.userNames[uid]}!`)
                    }
                    if (typeof this.storeController.goblins[uid] != 'undefined') {
                        this.setMessage(this.uid, `Hi Goblin!`)
                    }
            }
        },
        onMapClick(e) {
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
            let item
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
                    this.$refs.equipment.active = false
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
                        this.$refs.inventory.itemController.substract(this.selectedItem, 1)
                        this.lootController.drop(item, 1)
                        this.selectedItem = null
                        this.cursorMode = null
                        this.$refs.equipment.equipment.hand = null
                    }
                    break
                case "drop":
                    if (!isHidden && this.selectedItem) {
                        this.$refs.inventory.itemController.substractAll(this.selectedItem)
                        this.lootController.dropAll(item)
                        this.selectedItem = null
                        this.cursorMode = null
                        this.$refs.equipment.equipment.hand = null
                    }
                    break

            }
        },
        onInventoryClick() {
            this.$refs.inventory.itemController.inventoryOpen = !this.$refs.inventory.itemController.inventoryOpen

            if (!this.$refs.inventory.itemController.inventoryOpen) {
                this.cursorMode = null
            }
        },
        onGetItemFromStore(id, item) {
            this.$refs.inventory.itemController.inventoryOpen = true
            this.$refs.inventory.itemController.add(item)
            this.storeController.storesRef.child(id).child('items').child(item.slug).remove()
            this.setMessage(this.uid, `Picked up ${item.amount} ${item.name} from store`)
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
                this.onWatchPosition()
            }.bind(this)).catch(function(err) {
                console.log(err)
            })
        },
        onWatchPosition() {
            navigator.geolocation.clearWatch(this.watcher)

            this.watcher = navigator.geolocation.watchPosition((position) => {
                this.geoService.signal = 'geo-on'

                const data = {
                    position: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }

                this.userController.updateUser(this.uid, data)

            }, this.onWatchError.bind(this), {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 30000
            })
        },
        onWatchError(err) {
            if (typeof err != 'undefined') {
                this.geoService.signal = 'geo-off'
            }
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
        setMessage(uid, message) {
            window.dispatchEvent(new CustomEvent('message_add', {
                detail: {
                    uid: uid,
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
@import './app.scss';
</style>
