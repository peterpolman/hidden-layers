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
        <button
            v-on:click="onExpClick"
            class="btn btn-score" v-if="userController && userController.myUser">
            {{ userController.myUser.exp }}
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

    <Construction ref="construction" />

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
import Construction from './components/Construction.vue'

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
        Construction,
    },
    data() {
        return {
            assets: {
                tools: require('./assets/img/tools.png'),
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


            window.addEventListener('building.click', (data) => {
                this.onBuildingClick(data.detail)
            })
        }).catch((err) => {
            console.log(err)
        })
    },
    methods: {
        onExpClick() {
            alert(`You killed ${this.userController.myUser.exp} Goblins so far. ${(this.userController.myUser.exp > 0) ? 'Keep up the good work!' : ''} `)
        },
        discover() {
            const visibility = {
                user: this.userController.myUser,
                scout: this.scoutController.myScout,
                wards: this.lootController.myWards,
            }

            const positions = {
                users: this.userController.users,
                scouts: this.scoutController.scouts,
                goblins: this.storeController.goblins,
                loot: this.lootController.loot,
                buildings: this.$refs.construction.buildingController.buildings,
            }

            const discovered = this.mapService.getVisibleObjects(visibility, positions)

            this.userController.users = discovered.users
            this.scoutController.scouts = discovered.scouts
            this.storeController.goblins = discovered.goblins
            this.lootController.loot = discovered.loot
            this.$refs.construction.buildingController.buildings = discovered.buildings
        },
        onBuildingClick(data) {
            const buildingController = this.$refs.construction.buildingController
            const building = buildingController.buildings[data.id]

            switch (this.cursorMode) {
                case 'sword':
                    const damage = Math.floor(Math.random() * 10)

                    setMessage(null, `Building is hit for ${damage} damage.`)

                    building.setLabel(damage, false)

                    buildingController.update(data.id, {
                        hitPoints: building.hitPoints - damage
                    })
                    break
                case 'tools':
                    if (building.hitPoints >= building.hitPointsMax) {
                        setMessage(null, `This building is fully constructed!`)
                    }
                    else {
                        building.setLabel(10, true)

                        setMessage(null, `Building construction + 10`)
                        buildingController.update(data.id, {
                            hitPoints: building.hitPoints + 10
                        })
                    }
                    break
                default:
                    setMessage(this.uid, `Knock, knock. Hi ${this.userController.userNames[building.uid]}!`)
                    break
            }

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
                            const heal = 100
                            const healAmount = 100 - this.userController.users[uid].hitPoints
                            const data = {
                                mode: "HEALING",
                                hitPoints: heal,
                                healer: this.uid
                            }

                            this.userController.updateUser(uid, data)
                            this.userController.users[uid].setMessage(null, `${this.userController.userNames[data.healer]} heals ${this.userController.userNames[uid]} for ${healAmount} hit points!`)
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

                            setMessage(null, `${this.userController.userNames[this.uid]} hits a Goblin for ${damage} damage.`)
                        }
                        else if (goblin.hitPoints <= 0) {
                            goblin.setMap(null)

                            delete this.storeController.goblins[uid]

                            setMessage(null, `${this.userController.userNames[this.uid]} killed a goblin...`)
                            const user = this.userController.myUser
                            const exp = this.userController.myUser.exp + 1

                            this.userController.updateUser(this.uid, {
                                exp: exp
                            })
                        }
                        else {
                            setMessage(null, `${this.userController.userNames[this.uid]} failed to hit a Goblin...`)
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
                            setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]} for ${data.hitDmg} damage.`)
                            this.userController.updateUser(uid, data)
                        }
                        else if (this.userController.users[uid].hitPoints <= 0) {
                            setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]}'s dead corpse...`)
                        }
                        else {
                            setMessage(null, `${this.userController.userNames[data.attacker]} failed to hit ${this.userController.userNames[uid]}...`)
                        }
                    }
                    break
                default:
                    this.$refs.equipment.active = false
                    if (this.uid != uid && (typeof this.userController.users[uid] != 'undefined')) {
                        setMessage(this.uid, `Hi ${this.userController.userNames[uid]}!`)
                    }
                    if (typeof this.storeController.goblins[uid] != 'undefined') {
                        setMessage(this.uid, `Hi Goblin!`)
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
                case "build":
                    if (!isHidden && this.selectedItem) {
                        const id = this.createMarkerId(position)
                        const data = {
                            position: position,
                            uid: this.uid,
                            id: id,
                            name: this.selectedItem.name,
                            slug: this.selectedItem.slug,
                            stage: 1,
                            size: 100,
                            hitPoints: 10,
                            hitPointsMax: 500,
                        }
                        this.$refs.construction.buildingController.set(id, data)
                        this.selectedItem = null
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
            setMessage(this.uid, `Picked up ${item.amount} ${item.name} from store`)
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

.btn-score {
    background: white;
    color: black;
    font-size: 16px;
    font-weight: bold;
}
</style>
