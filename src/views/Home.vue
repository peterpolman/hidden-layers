<template>
    <div>
        <base-map @click="onMapClick($event)" />

        <div class="map-ui" v-if="map">
            <base-profile />
            <base-inventory />

            <div class="users">
                <base-user class="user" v-for="(user, key) of users" :user="user" :key="key" />
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

.users {
    display: flex;
    flex-wrap: wrap;
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 65px;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.25rem;
}
</style>
