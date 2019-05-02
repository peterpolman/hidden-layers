<template>
<section class="section section-home">
    <div class="google-map" id="home-map"></div>

    <Messages ref="messages" />

    <Character ref="character" />

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
        <button v-if="userController && userController.myUser"
            v-bind:style="{ backgroundImage: 'url(' + assets[userController.myUser.userClass] + ')' }"
            v-on:click="openCharacterInfo()"
            class="btn btn-more">
            Character
        </button>
        <button v-if="userController && userController.myUser" v-bind:style="{ backgroundImage: 'url(' + assets[userController.myUser.userClass] + ')' }" v-on:click="onPanUserClick" class="btn">
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

    <button
    v-bind:style="{ backgroundImage: 'url(' + assets.x + ')' }"
    v-on:click="onFarmClick"
    class="btn btn-farm">
        Farm
    </button>

    <Store ref="store" />
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
import Store from './components/Store.vue'
import Character from './Character.vue'

// Import services
import MapService from './services/MapService'
import GeoService from './services/GeoService'

// Import controllers
import UserController from './controllers/UserController'
import ScoutController from './controllers/ScoutController'
import LootController from './controllers/LootController'
import EnemyController from './controllers/EnemyController'
import FarmController from './controllers/FarmController'

export default {
    name: 'home',
    components: {
        Messages,
        Equipment,
        Inventory,
        Construction,
        Store,
        Character,
    },
    data() {
        return {
            assets: {
                x: require('./assets/img/x.png'),
                tools: require('./assets/img/tools.png'),
                ward: require('./assets/img/ward-1.png'),
                knight: require('./assets/img/knight-1.png'),
                archer: require('./assets/img/archer-1.png'),
                wizard: require('./assets/img/wizard-1.png'),
                scout: require('./assets/img/wolf-0.png'),
                gold: require('./assets/img/coin.png'),
                potion: require('./assets/img/potion.png'),
                sword: require('./assets/img/woodSword.png'),
                discover: require('./assets/img/discover.png')
            },
            userClass: null,
            wardIndex: 0,
            users: [],
            scouts: [],
            messages: [],
            selectedItem: {},
            selectedStore: {},
            uid: firebase.auth().currentUser.uid,
            watcher: null,
            mapService: new MapService(),
            geoService: new GeoService(),
            farmController: null,
            userController: null,
            scoutController: null,
            lootController: null,
            enemyController: new EnemyController()
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.mapService.init().then((map) => {
                const uid = firebase.auth().currentUser.uid
                const usersRef = firebase.database().ref('users')
                const scoutsRef = firebase.database().ref('scouts')
                const lootRef = firebase.database().ref('loot')
                const enemiesRef = firebase.database().ref('enemies')

                this.userController = new UserController(uid)
                this.scoutController = new ScoutController(uid)
                this.lootController = new LootController(uid)
                this.farmController = new FarmController()

                this.scoutController.userNames = this.userController.userNames

                MAP.addListener('click', (e) => {
                    this.onMapClick(e);
                })

                window.addEventListener('character.click', (data) => {
                    this.onUserClick(data.detail.id, data.detail.target)
                })

                window.addEventListener('building.click', (data) => {
                    this.onBuildingClick(data.detail)
                })

                scoutsRef.on('child_added', (snap) => this.discover())
                scoutsRef.on('child_changed', (snap) => this.discover())
                scoutsRef.on('child_removed', (snap) => this.discover())
                usersRef.on('child_changed', (snap) => this.discover())
                lootRef.on('child_added', (snap) => this.discover())
                lootRef.on('child_changed', (snap) => this.discover())
                lootRef.on('child_removed', (snap) => this.discover())
                enemiesRef.on('child_added', (snap) => this.discover())

            }).catch((err) => {
                console.log(err)
            })
        })
    },
    methods: {
        onFarmClick() {
            this.cursorMode = 'farm'
        },
        openCharacterInfo() {
            this.$refs.character.selectedItem = this.selectedItem
            this.$refs.character.inventory = this.$refs.inventory.inventoryController.inventory
            this.$refs.character.myUser = this.userController.myUser
            this.$refs.character.myFarm = this.farmController.farms[this.uid]
            this.$refs.character.open = true
        },
        discover(radius) {
            const visibility = {
                user: this.userController.myUser,
                scout: this.scoutController.myScout,
                wards: this.lootController.myWards,
            }

            const positions = {
                users: this.userController.users,
                scouts: this.scoutController.scouts,
                loot: this.lootController.loot,
                goblins: this.enemyController.goblins,
                buildings: this.$refs.construction.buildingController.buildings,
            }

            const discovered = this.mapService.getVisibleObjects(visibility, positions)

            this.userController.users = discovered.users
            this.scoutController.scouts = discovered.scouts
            this.lootController.loot = discovered.loot
            this.enemyController.goblins = discovered.goblins
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
                        buildingController.update(data.id, {
                            hitPoints: building.hitPoints + 10
                        })

                        setMessage(this.uid, `Building construction + 10`)
                    }
                    break
                default:
                    setMessage(this.uid, `Knock, knock. Hi ${this.userController.userNames[building.uid]}!`)
                    break
            }

        },
        onUserClick(uid, target) {
            const inventoryController = this.$refs.inventory.inventoryController

            switch (this.cursorMode) {
                // case 'gold':
                //     inventoryController.substract(this.selectedItem, 1)
                //     inventoryController.give(uid, this.selectedItem, 1)
                //     break;
                case 'potion':
                    if (this.selectedItem) {
                        inventoryController.substract(this.selectedItem, 1)

                        if (target === 'user') {
                            const heal = 100
                            const healAmount = 100 - this.userController.users[uid].hitPoints
                            const data = {
                                mode: "HEALING",
                                hitPoints: heal,
                                healer: this.uid
                            }

                            this.userController.updateUser(uid, data)
                            setMessage(null, `${this.userController.userNames[data.healer]} heals ${this.userController.userNames[uid]} for ${healAmount} hit points!`)
                        }
                        if (target === 'scout') {
                            const heal = 100
                            const healAmount = 100 - this.scoutController.scouts[uid].hitPoints
                            const data = {
                                mode: "HEALING",
                                hitPoints: heal,
                                healer: this.uid
                            }

                            this.scoutController.scouts[uid].update(data)
                            setMessage(null, `${this.userController.userNames[data.healer]} heals ${this.userController.userNames[uid]}'s scout' for ${healAmount} hit points!`)
                        }
                        if (target === 'goblin') {
                            const hitPoints = 100
                            const goblin = this.enemyController.goblins[uid]

                            goblin.indicator.setMap(MAP)

                            goblin.setHitPoints(hitPoints)
                            setMessage(null, `${this.userController.userNames[this.uid]} heals an injured Goblin.`)

                            this.enemyController.goblins[uid] = goblin
                        }

                        this.selectedItem = null
                        this.cursorMode = null
                    }
                    break
                case 'sword':
                    if (target === 'goblin') {
                        const goblin = this.enemyController.goblins[uid]
                        const damage = Math.floor(Math.random() * 10)
                        const hitPoints = (goblin.hitPoints - damage)

                        goblin.indicator.setMap(MAP)

                        if (!goblin.hasTalked) {
                            goblin.talk()
                        }

                        if (damage > 0 && goblin.hitPoints > 0) {
                            goblin.setLabel( damage )
                            goblin.setHitPoints( hitPoints )

                            this.enemyController.goblins[uid] = goblin

                            setMessage(null, `${this.userController.userNames[this.uid]} hits a Goblin for ${damage} damage.`)
                        }
                        else if (goblin.hitPoints <= 0) {
                            goblin.setMap(null)

                            delete this.enemyController.goblins[uid]

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

                    if (uid !== this.uid && target === 'user') {
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
                            // const position = this.userController.users[uid].position
                            // const item = {
                            //     id: this.createMarkerId(position),
                            //     slug: 'gold',
                            //     name: 'Gold',
                            //     position: position,
                            //     uid: uid,
                            // }
                            // this.lootController.dropAll(item)

                            setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]}'s dead corpse...`)
                        }
                        else {
                            setMessage(null, `${this.userController.userNames[data.attacker]} failed to hit ${this.userController.userNames[uid]}...`)
                        }
                    }

                    if (uid !== this.uid && target === 'scout') {
                        const damage = Math.floor(Math.random() * 10)
                        const data = {
                            mode: 'FIGHTING',
                            hitDmg: damage,
                            attacker: this.uid,
                            hitPoints: this.scoutController.scouts[uid].hitPoints - damage
                        }

                        if ((data.hitDmg > 0) && (this.scoutController.scouts[uid].hitPoints > 0)) {
                            this.scoutController.scouts[uid].setMode("STANDING")
                            this.scoutController.scouts[uid].update(data)
                            this.scoutController.scouts[uid].indicator.setMap(MAP)

                            setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]}'s scout for ${data.hitDmg} damage.`)
                        }
                        else if (this.scoutController.scouts[uid].hitPoints <= 0) {
                            this.scoutController.scouts[uid].kill()

                            setMessage(null, `${this.userController.userNames[data.attacker]} hits ${this.userController.userNames[uid]} his scout's dead corpse...`)
                        }
                        else {
                            setMessage(null, `${this.userController.userNames[data.attacker]} failed to hit ${this.userController.userNames[uid]}'s scout'...`)
                        }
                    }
                    break
                default:
                    this.$refs.equipment.active = false
                    if (target === 'user') {
                        setMessage(this.uid, `Hi ${this.userController.userNames[uid]}!`)
                    }
                    if (target === 'scout') {
                        setMessage(this.uid, `Hi ${this.userController.userNames[uid]}' scout!`)
                    }
                    if (target === 'goblin') {
                        setMessage(this.uid, `Hi Goblin!`)
                    }
            }
        },
        onMapClick(e) {
            const storeController = this.$refs.store.storeController
            const inventoryController = this.$refs.inventory.inventoryController
            const visibility = { user: this.userController.myUser, scout: this.scoutController.myScout, wards: this.lootController.myWards }
            const isHidden = this.mapService.isPositionHidden(e.latLng, visibility)
            const position = { lat: e.latLng.lat(), lng: e.latLng.lng(), }

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
                    storeController.getPlaceDetails(e)
                    this.$refs.equipment.active = false
                    this.cursorMode = null
                }
                e.stop()
            }

            switch (this.cursorMode) {
                case "scout":
                    this.scoutController.moveScout(e.latLng)
                    this.handlePixelClick(e.pixel)
                    break
                case "ward":
                    if (!isHidden && this.selectedItem) {
                        inventoryController.substract(this.selectedItem, 1)
                        this.lootController.drop(item, 1)
                        this.selectedItem = null
                        this.cursorMode = null
                        this.$refs.equipment.equipment.hand = null

                        this.handlePixelClick(e.pixel)
                    }
                    break
                case "house":
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

                        this.handlePixelClick(e.pixel)
                    }
                    break
                case "discover":
                    window.MAP.set('minZoom', 16)
                    window.MAP.setZoom(16)
                    inventoryController.substract(this.selectedItem, 1)

                    for (let i in this.userController.users) {
                        this.userController.users[i].setVisible(true)
                    }

                    for (let i in this.scoutController.scouts) {
                        this.scoutController.scouts[i].setVisible(true)
                    }

                    for (let i in this.enemyController.goblins) {
                        this.enemyController.goblins[i].setVisible(false)
                    }

                    setTimeout(() => {
                        window.MAP.setZoom(18)
                        window.MAP.set('minZoom', 18)
                        this.discover(500)
                    }, 30000)

                    this.handlePixelClick(e.pixel)

                    break
                case "drop":
                    if (!isHidden && this.selectedItem) {
                        inventoryController.substractAll(this.selectedItem)
                        this.lootController.dropAll(item)
                        this.selectedItem = null
                        this.cursorMode = null
                        this.$refs.equipment.equipment.hand = null

                        this.handlePixelClick(e.pixel)
                    }
                    break
                case "farm":
                    this.farmController.gatherResources(position)
                    break;
                default:
                    this.handlePixelClick(e.pixel)
                    break;
            }
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
            const index = Object.keys(wards)[this.wardIndex]

            MAP.panTo(wards[index].marker.position)

            if (this.wardIndex == (wards.length - 1)) {
                this.wardIndex = 0
            }
            else {
                this.wardIndex++
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
        handlePixelClick(pixel) {
            let d = document.createElement("div")
            d.className = "click-effect"
            d.style.top = pixel.y + "px"
            d.style.left = pixel.x + "px"
            document.getElementsByClassName('section-home')[0].appendChild(d)
            d.addEventListener('animationend', function() {
                d.parentElement.removeChild(d)
            })
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
@import url('./button.scss');

body {
    background: black;
}

.google-map {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    background: black;
    display: block;
    font-family: 'Roboto', Helvetica, Arial, sans-serif;
}

.section-settings {
    top: 0;
    right: 0;
    position: fixed;

    .btn {
        position: relative;
    }
}

.section-pan {
    top: 5px;
    left: 15px;
    position: fixed;

    .btn {
        position: relative;
        background-size: 60% auto;
        margin: 10px auto;
        border-radius: 50%;
    }
}

.label-dmg {
    color: red;
    font-weight: bold;
    font-size: 1rem;
}

.section-pan .btn-more {
    font-size: 10px;
    margin-bottom: 15px;
    width: 60px;
    height: 60px;
    background-color: #333;
    font-size: 0;
    color: white;
    border-radius: 50%;
    background-size: 60% auto;
    box-shadow: 0 0 5px 3px #3D91CB;
}

</style>
