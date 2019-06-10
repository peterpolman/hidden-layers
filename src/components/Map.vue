<template>
    <div id="map"></div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import config from '../config.js';

export default {
    name: 'Map',
    mounted() {
        mapboxgl.accessToken = config.mapbox.key

        const MAP = window.MAP = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/peterpolman/cjsli3aee5gab1fl9lpwyx2rd',
            zoom: 16,
            maxZoom: 21,
            minZoom: 16,
            center: [4.8437, 52.3669],
            pitch: 85,
            bearing: 45,
            antialias: true,
            doubleClickZoom: true,
            pitchWithRotate: false
        });

        MAP.on('click', 'water', function (e) {
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('You discovered some water! Add it to your resources.')
                .addTo(MAP);
        });

        MAP.on('load', function() {
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
                    'fill-extrusion-opacity': .6
                }
            }, layers[layers.length-1].id);
        });

        // let tag = document.createElement('SCRIPT');
        // tag.type = "text/javascript";
        // tag.src = `https://maps.googleapis.com/maps/api/js?key=${config.google.key}&libraries=places,directions`;
        // document.body.appendChild(tag);
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
