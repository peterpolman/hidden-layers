<template>
    <div>
        <Map />
        <Inventory class="ui-inventory" />
        <Profile
            v-if="user && scout"
            v-bind:user="user"
            v-bind:scout="scout"
            class="ui-profile" />
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
import HiddenLayer from './HiddenLayer';
import User from './models/User';
import Scout from './models/Scout';
import GeoService from './services/GeoService';

export default {
    name: 'app',
    components: {
        Map,
        Inventory,
        Profile
    },
    data() {
        return {
            user: null,
            scout: null,
            items: null,
            spawnSerice: null,
        }
    },
    mounted() {
        const MAP = window.MAP;
        const usersRef = firebase.database().ref('users2');
        const scoutsRef = firebase.database().ref('scouts2');
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


            // Load the user data
            usersRef.child(uid).once('value').then(snap => {
                // Add to layer array before buildings.
                MAP.addLayer(HL, layers[layers.length-1].id);

                // Creates my user
                this.user = HL.user = new User(snap.key, snap.val());
                HL.markerService.positions[this.user.id] = this.user.position;

                // Load the scout data
                scoutsRef.child(this.user.scout).once('value').then(snap => {

                    // Creates my user and discovers for position.
                    this.scout = HL.scout = new Scout(snap.key, snap.val());
                    HL.markerService.positions[this.scout.id] = this.scout.position;

                    HL.geoService = new GeoService();

                    // Start discovery
                    HL.updateFog();

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
    margin: 0;
    height: 100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    background: #292929;
    color: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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

.ui-wrapper {
    position: fixed;
    top: .5rem;
    left: .5rem;
}

.ui-actions {
    position: fixed;
    top: .5rem;
    right: .5rem;
    width: auto;
}

.ui-profile {
    position: fixed;
    top: .5rem;
    left: .5rem;
}

.ui-inventory {
    position: fixed;
    right: .5rem;
    bottom: .5rem;
}

.btn {
    display: inline-block;
    position: relative;
    margin-right: .5rem;
    text-transform: uppercase;
    border-radius: 2px;
    background: white;
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

.row {

}

.flex {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.form {
    display: block;
    max-width: 220px;
    margin: auto;
}

.form-item {
    width: 100%;
}

.input-text {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #EFEFEF;
    border-radius: 5px;
    padding: .7rem;
    font-size: 1rem;
    display: block;
    margin-bottom: .5rem;
    color: black;
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
</style>
