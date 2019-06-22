<template>
    <div class="container">
        <Messages class="ui-messages"/>
        <Map />
        <Profile
            v-if="user && scout"
            v-bind:user="user"
            v-bind:scout="scout"
            class="ui-profile" />
        <Target class="ui-target" />
        <Input class="ui-input"/>
        <Inventory class="ui-inventory" />
        <div class="ui-actions">
            <button v-on:click="reload()" class="btn btn-default">Reload</button>
            <button v-on:click="logout()" class="btn btn-default">Logout</button>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import Map from './components/Map.vue';
import Inventory from './components/Inventory.vue';
import Profile from './components/Profile.vue';
import Target from './components/Target.vue';
import HiddenLayer from './HiddenLayer';
import User from './models/User';
import Scout from './models/Scout';
import GeoService from './services/GeoService';
import Messages from './components/Messages';
import Input from './components/Input';

export default {
    name: 'app',
    components: {
        Map,
        Inventory,
        Profile,
        Target,
        Messages,
        Input,
    },
    data() {
        return {
            target: null,
            user: null,
            scout: null,
            items: null,
        }
    },
    mounted() {
        const MAP = window.MAP;
        const usersRef = firebase.database().ref('users');
        const scoutsRef = firebase.database().ref('scouts');
        const uid = firebase.auth().currentUser.uid;

        MAP.on('load', () => {
            const HL = window.HL = new HiddenLayer();
            const layers = MAP.getStyle().layers;

            MAP.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#EFEFEF',
                    'fill-extrusion-height': [
                        "interpolate", ["linear"],
                        ["zoom"],
                        15, 0,
                        15.05, ["get", "height"]
                    ],
                    'fill-extrusion-base': [
                        "interpolate", ["linear"],
                        ["zoom"],
                        15, 0,
                        15.05, ["get", "min_height"]
                    ],
                    'fill-extrusion-opacity': .45
                }
            }, layers[layers.length-1].id);

            let positions = [];

            // Load the user data
            usersRef.child(uid).once('value').then(snap => {
                let data = snap.val();
                // // Creates my user
                this.user = HL.user = new User(snap.key, data);
                positions[this.user.id] = HL.markerService.positions[this.user.id] = this.user.position;

                // Load the scout data
                scoutsRef.child(this.user.scout).once('value').then(snap => {
                    let data = snap.val();

                    // If the wolf does not exist, reset it in the db
                    if (data == null) {
                        data = {
                            position: this.user.position,
                            hitPoints: 100,
                            level: 1,
                            race: 'wolf',
                            name: `${this.user.name}'s scout`,
                            uid: this.user.id,
                        }
                        scoutsRef.child(this.user.scout).set(data);
                    }

                    // Creates my user and discovers for position.
                    this.scout = HL.scout = new Scout(snap.key, data);
                    positions[this.scout.id] = HL.markerService.positions[this.scout.id] = this.scout.position;

                    HL.geoService = new GeoService();
                    HL.geoService.watchPosition();

                    // Start discovery
                    HL.fog.updateFog(positions);

                    console.log("Initial discovery started!");
                });
            });
        });
    },
    methods: {
        logout() {
            firebase.auth().signOut().then(() => {
                this.$router.replace('login')
            })
        },
        reload() {
            return location.reload(true);
        }
    }
}
</script>

<style>
html,
body {
    height: 100%;
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    background: #3f2d42;
    color: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

*:focus {
    outline: none;
}

h1 {
    font-weight: bold;
    color: #fdc539;
    text-transform: uppercase;
    font-size: 1.2rem;
    text-shadow: 1px 1px 0px rgba(0,0,0,.75);
    text-align: center;
    border-bottom: 1px solid #EFEFEF;
    padding-bottom: .5rem;
    margin-bottom: 1rem;
    width: 100%;
}

h2 {
    margin-top: 2rem;
    font-weight: bold;
    color: #fdc539;
    font-size: 1rem;
    text-shadow: 1px 1px 0px rgba(0,0,0,.75);
}

.container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.ui-input {
    position: fixed;
    right: 10px;
    bottom: 130px;
}

.ui-input .message-form {
    display: block;
    position: fixed;
    width: 100%;
    max-width: 300px;
    bottom: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -150px;
}

.ui-messages {
    position: fixed;
    top: 0;
    height: 50px;
    width: 100%;
}

.ui-messages + #map {
    top: 50px;
}

.ui-actions {
    position: fixed;
    top: calc(50px + .5rem);
    right: .5rem;
    width: auto;
}

.ui-profile {
    position: fixed;
    top: calc(50px + .5rem);
    left: .5rem;
}

.ui-inventory {
    position: fixed;
    right: 10px;
    bottom: 10px;
}

.ui-target {
    position: fixed;
    left: .5rem;
    bottom: .5rem;
}

.btn {
    display: inline-block;
    position: relative;
    margin-right: .5rem;
    text-transform: uppercase;
    border-radius: 2px;
    background: white;
    cursor: pointer;
}

.btn-default {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    padding: 5px;
}

.btn-image {
    width: 40px;
    height: 40px;
    padding: 5px;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: white;
    background-size: 50% 50%;
    font-size: 0;
    border: 0;
}

.btn-image.active,
.btn-image:active {
    background-color: #fdc539;
}

.btn-image small {
    position: absolute;
    font-size: 8px;
    padding: 2px;
    background-color: black;
    font-weight: bold;
    color: white;
    bottom: 0;
    right: 0;
    border-top-left-radius: 2px;
    border-bottom-right-radius: 2px;
}

.panel {
    border-radius: 2px;
    margin: auto;
    display: flex;
    background: rgba(0,0,0,0.4);
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    padding: 5px;
}

.panel ul {
    margin: 0;
    list-style: none;
    padding: 0;
    min-width: 50px;
    min-height: 50px;
}

.panel li {
    margin: 5px;
    border-radius: 2px;
    width: 40px;
    height: 40px;
    background-color: rgba(0,0,0,0.5);
    display: block;
    flex: 0 40px;
}

.flex {
    height: 100%;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.form {
    display: block;
    width: 220px;
    margin: auto;
}

.form-item {
    width: 100%;
}

input.input-text {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #fdc539;
    border-radius: 5px;
    padding: .7rem;
    font-size: 1rem;
    display: block;
    margin-bottom: .5rem;
    color: white;
    background-color: rgba(0,0,0,0.5);
    font-weight: bold;
    box-shadow: 0 0px 15px rgba(0,0,0,.75);
}

.btn-primary {
    margin-top: 1rem;
    background-color: #fdc539;
    padding: .7rem 1rem;
    font-size: 1rem;
    color: #292929;
    font-weight: bold;
    display: block;
    border: 0;
    width: 100%;
    box-shadow: 0 0px 15px rgba(0,0,0,.75);
}

p  a {
    color: #fdc539;
}

.align-center {
    text-align: center;
}

input[type="radio"],
input[type="checkbox"] {
	position: absolute;
	left: -9999px;
	opacity: 0;
}

input[type="radio"] + label,
input[type="checkbox"] + label {
	cursor: pointer;
	user-select: none;
	padding-left: calc(25px + .5rem);
	padding-right: .5rem;
	line-height: 24px;
	position: relative;
	color: white;
	transition: .2s color ease;
    font-weight: bold;
    display: block;
    margin-bottom: .5rem;
}

input[type="radio"] + label:before,
input[type="checkbox"] + label:before {
	content: '';
	display: block;
    width: 16px;
    height: 16px;
    border: 3px solid rgba(255,255,255,.5);
	background: transparent;
	position: absolute;
	left: 0;
	top: 0;
	border-radius: 3px;
	transform: 0.2s border-color ease;
}

input[type="radio"] + label:after,
input[type="checkbox"] + label:after {
    content: '';
	display: block;
	position: absolute;
	height: 10px;
	width: 10px;
	background-color: rgba(255,255,255,.5);
	top: 6px;
	left: 6px;
	transition: 0.2s background-color ease;
}

input[type="radio"]:checked:disabled + label,
input[type="checkbox"]:checked:disabled + label {
    background: transparent;
    border: none;
    cursor: not-allowed;
    color: rgba(255,255,255,.5);
}

input[type="radio"]:checked + label,
input[type="checkbox"]:checked + label {
	color: white;
	font-weight: bold;
}

input[type="radio"]:checked + label:before,
input[type="checkbox"]:checked + label:before {
    border-color: #fdc539;
}

input[type="radio"]:checked + label:after,
input[type="checkbox"]:checked + label:after {
    background-color: #fdc539;
}


@media (min-width: 1024px) {
    input[type="radio"] + label,
    input[type="checkbox"] + label {
        display: inline-block;
        margin-bottom: 0;
        margin-right: 1rem;
    }

    .form {
        width: 360px;
    }

    .flex-md {
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
}

.character-hit {
    color: white;
    font-weight: bold;
    position: absolute;
    bottom: 50px;
    left: 50%;
    margin-left: -10px;
    width: 20px;
    font-size: 16px;
    text-align: center;
    transition: all 1.5s ease-in-out;
}

.character-hit.dmg {
    color: red;
}

.character-hit.heal {
    color: rgb(140, 198, 62);
}
</style>
