<template>
    <div>
        <base-map @click="onMapClick($event)" />
        <base-fog v-if="tb && account" :account="account" />

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
