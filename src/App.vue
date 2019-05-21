<template>
    <Map />
</template>

<script>
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
                markers.setMyPosition(position);
                map.setCenter(position);
            }, (err) => {
                console.log(err);
            }, this.options
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
