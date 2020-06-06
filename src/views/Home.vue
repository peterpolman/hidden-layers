<template>
    <div v-if="account">
        <base-map @click="onMapClick($event)" />
        <base-fog v-if="tb" :account="account" />

        <div class="map-ui" v-if="map">
            <base-profile />
            <base-inventory />
            <base-action :main="equipment.main" :off="equipment.off" :target="selected" />

            <div class="nearby">
                <component :is="marker.component" v-for="marker of all" :marker="marker" :key="marker.id" />
            </div>
        </div>
    </div>
</template>

<script src="./Home.ts" lang="ts"></script>
