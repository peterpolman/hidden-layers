<template>
    <div id="map"></div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import config from '../config.js';

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

        const MAP = window.MAP = new mapboxgl.Map({
            container: 'map',
            style: require('../assets/style.json'),
            zoom: 19,
            maxZoom: 21,
            minZoom: 16,
            center: [4.8437, 52.3669],
            pitch: 85,
            bearing: 45,
            antialias: false,
            doubleClickZoom: false,
            pitchWithRotate: false
        });

        MAP.on('click', 'water', function (e) {
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('You discovered some water! Add it to your resources.')
                .addTo(MAP);
        });
    }
}
</script>

<style>
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
}

.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
    display: none !important;
}
</style>
