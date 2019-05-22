<template>
    <Map />
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import Map from './components/Map.vue'
import MarkerService from './services/MarkerService.js'

export default {
    name: 'app',
    components: {
        Map
    },
    mounted() {
        var markers = new MarkerService;

        navigator.geolocation.watchPosition(
            (r) => {
                const position = {
                    lat: r.coords.latitude,
                    lng: r.coords.longitude
                };

                firebase.database().ref(`users2/${firebase.auth().currentUser.uid}`).child('position').set(position);
            }, (err) => {
                console.log(err);
            }, {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 30000
            }
        );
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
</style>
