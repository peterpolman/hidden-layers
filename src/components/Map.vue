<template>
<div id="map"></div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import config from '../config.js';
import GeoService from '../services/GeoService';

export default {
    name: 'Map',
    mounted() {
        mapboxgl.accessToken = config.mapbox.key;
        const geo = new GeoService();
        const MAP = window.MAP = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/peterpolman/cjsli3aee5gab1fl9lpwyx2rd',
            zoom: 20,
            maxZoom: 20,
            minZoom: 17,
            dragZoom: true,
            dragPan: false,
            center: [4.8437, 52.3669],
            pitch: 60,
            bearing: 45,
            antialias: true,
            pitchWithRotate: false,
            touchZoomRotate: false,
            doubleClickZoom: false,
            scrollZoom: false
        });

        MAP.addControl(new mapboxgl.NavigationControl());

        MAP.on('load', function() {
            geo.getPosition().then((position) => MAP.setCenter(position));

            var layers = MAP.getStyle().layers;

            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

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
            }, labelLayerId);

            var tag = document.createElement('SCRIPT');
            tag.type = "text/javascript";
            tag.src = `https://maps.googleapis.com/maps/api/js?key=${config.google.key}&libraries=places`;
            document.body.appendChild(tag);
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
