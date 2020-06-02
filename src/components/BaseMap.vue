<template>
    <div ref="map" id="map"></div>
</template>
<script src="./BaseMap.ts" lang="ts"></script>
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
