<template>
<div id="map"></div>
</template>

<script>
import config from '../config.js';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import * as THREE from 'three';

export default {
    name: 'Map',
    props: {

    },
    mounted() {
        var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

        mapboxgl.accessToken = config.mapbox.key;

        var map = window.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/peterpolman/cjsli3aee5gab1fl9lpwyx2rd',
            zoom: 19,
            maxZoom: 22,
            minZoom: 13,
            center: [4.8437, 52.3669],
            pitch: 60,
            bearing: 45
        });

        map.on('load', function() {
            // Insert the layer beneath any symbol layer.
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

                    // use an 'interpolate' expression to add a smooth transition effect to the
                    // buildings as the user zooms in
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
