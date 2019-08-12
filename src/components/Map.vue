<template>
    <div id="map"></div>
</template>

<script>
const mapboxgl = window.mapboxgl;

import config from '../config.js';
import GeoService from '../services/GeoService';

export default {
    name: 'Map',
    data() {
        return {
            map: null,
        }
    },
    mounted() {
        mapboxgl.accessToken = config.mapbox.key

        // HACK For cleanup purposes
        if (typeof window.MAP != 'undefined') {
            location.reload(true);
        }

        const hours = new Date().getHours();
        const MAP = window.MAP = new mapboxgl.Map({
            container: 'map',
            // style: (hours > 7 && hours < 19) ? require('../assets/style.json') : require('../assets/style-dark.json'),
            style: require('../assets/style-raw.json'),
            zoom: 19,
            maxZoom: 21,
            minZoom: 16,
            center: [4.8437, 52.3669],
            pitch: 75,
            bearing: 45,
            antialias: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: false,
            scrollZoom: false,
            boxZoom: false,
            dragRotate: true,
        });
    }
}
</script>

<style>
#map {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
}

.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
    display: none !important;
}
</style>
