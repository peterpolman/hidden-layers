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
        </div>
    </div>
</template>

<script>
import Map from './components/Map.vue';
import Inventory from './components/Inventory.vue';
import Profile from './components/Profile.vue';
import MarkerService from './services/MarkerService';
import firebase from 'firebase/app';
import HiddenLayer from './models/HiddenLayer';
import User from './models/User';
import Scout from './models/Scout';

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
            items: null
        }
    },
    mounted() {
        const markerService = new MarkerService;
        const MAP = window.MAP;
        const uid = firebase.auth().currentUser.uid;

        MAP.on('load', () => {
            const usersRef = firebase.database().ref(`users2/`);
            const scoutsRef = firebase.database().ref(`scouts2/`);

            // Load the user data
            usersRef.child(uid).once('value').then(snap => {
                const HL = window.HL = new HiddenLayer();
                const position = snap.val().position;

                // Add to layer array before buildings.
                MAP.addLayer(HL, '3d-buildings');

                // Creates my user
                this.user = HL.markers[snap.key] = new User(snap.key, snap.val());

                // Load the scout data
                scoutsRef.child(this.user.scout).once('value').then(snap => {

                    // Creates my user and discovers for position.
                    this.scout = HL.markers[this.user.scout] = new Scout(snap.key, snap.val());

                    // Loads all nearby markers based on the uid.
                    markerService.loadNearbyMarkers(this.user.id, position);
                    HL.discover(this.user.id);

                    console.log("Initial discovery for user! ", this.user.id, position);
                });
            });
        });
    },
    methods: {
        reload() {
            location.reload(true);
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
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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


</style>
