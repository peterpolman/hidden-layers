<template>
    <div v-if="account">
        <base-map @click="onMapClick($event)" />
        <base-fog v-if="tb" :account="account" />

        <header class="menu">
            <b-button @click="logout()" class="btn close btn-secondary">
                <span>×</span>
            </b-button>
        </header>

        <div class="map-ui" v-if="map">
            <base-profile />
            <base-inventory />
            <base-action :main="equipment.main" :off="equipment.off" :target="selected" />

            <div class="nearby">
                <component :is="marker.race" v-for="marker of all" :character="marker" :key="marker.id" />
            </div>
        </div>
    </div>
</template>

<script src="./Home.ts" lang="ts"></script>

<style scoped>
.menu {
    background: rgba(0, 0, 0, 0.5);
    left: 0;
    top: 0;
    right: 0;
    position: fixed;
    z-index: 1;
    border: 0;
}
</style>
