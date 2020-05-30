<template>
    <div>
        <base-map @click="onMapClick($event)" />

        <div class="map-ui" v-if="map">
            <base-profile />
            <base-inventory />

            <div class="nearby">
                <component :is="marker.race" v-for="marker of all" :marker="marker" :key="marker.id" />
            </div>
        </div>
    </div>
</template>

<script src="./Home.ts" lang="ts"></script>

<style>
.btn-square {
    position: relative;
    border-radius: 4px;
    margin: 0.25rem;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.25);
}

.nearby {
    display: block;
    position: absolute;
    top: 0rem;
    right: 1rem;
    width: 220px;
}

.profile {
    display: flex;
    align-items: center;
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: 100%;
    max-width: 200px;
}

.profile .btn-circle {
    flex: 0 60px;
    margin-right: 0.5rem;
    background-color: rgba(0, 0, 0, 0.5);
    border: 0;
    border-radius: 50%;
    padding: 0.5rem;
    width: 60px;
    height: 60px;
    border: 2px solid #d19a66;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

.profile .btn-circle img {
    transform: scale(2.5);
}

.profile-level {
    border: 2px solid #d19a66;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 10px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    font-weight: bold;
    position: absolute;
    bottom: -2px;
    left: -2px;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
}

.profile-info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    color: white;
    font-family: Arial;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.profile-progress {
    display: block;
    width: 100%;
}

.profile-hp {
    margin-bottom: 0.5rem;
}

.profile-hp,
.profile-xp {
    height: 8px;
    border-radius: 3px;
    margin-bottom: 0.25rem;
    width: 100%;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
