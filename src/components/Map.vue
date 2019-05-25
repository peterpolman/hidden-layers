<template>
<div id="map"></div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import config from '../config.js';
import * as THREE from 'three';

export default {
    name: 'Map',
    mounted() {
        mapboxgl.accessToken = config.mapbox.key;

        const map = window.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/peterpolman/cjsli3aee5gab1fl9lpwyx2rd',
            zoom: 19,
            maxZoom: 22,
            minZoom: 10,
            center: [4.8437, 52.3669],
            pitch: 60,
            bearing: 45
        });

        map.on('load', function() {

            navigator.geolocation.getCurrentPosition(
                (r) => map.setCenter({ lat: r.coords.latitude, lng: r.coords.longitude }),
                (err) => console.log(err),
                {enableHighAccuracy: true, maximumAge: 1000, timeout: 30000}
            );

            var layers = map.getStyle().layers;

            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            map.addLayer({
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
                    'fill-extrusion-opacity': .6
                }
            }, labelLayerId);

            console.log(map.getStyle().layers)
        });
    }
}
</script>

<style scoped>
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
}
</style>
