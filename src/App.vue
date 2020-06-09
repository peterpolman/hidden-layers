<template>
    <div class="map-container">
        <router-view></router-view>
        <small class="ui-version">v{{ $version }}</small>
    </div>
</template>
<script src="./App.ts" lang="ts"></script>
<style scoped>
.ui-version {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    z-index: 2;
}
</style>
