<template>
    <div class="map-container">
        <div ref="map" id="map"></div>
        <div class="mini-map">
            <div ref="miniMap" id="miniMap"></div>
            <b-button variant="primary" @click="logout()" class="btn-icon btn-logout">
                <i class="fas fa-sign-out-alt"></i>
            </b-button>
            <b-button variant="primary" @click="toggleLockCamera()" class="btn-icon btn-lock-camera">
                <i v-if="account.lockCamera" class="fas fa-lock"></i>
                <i v-else class="fas fa-unlock"></i>
            </b-button>
            <b-button variant="primary" class="btn-icon btn-zoom-in" @click="zoomIn()">
                <i class="fas fa-plus"></i>
            </b-button>
            <b-button variant="primary" class="btn-icon btn-zoom-out" @click="zoomOut()">
                <i class="fas fa-minus"></i>
            </b-button>
        </div>
    </div>
</template>
<script src="./BaseMap.ts" lang="ts"></script>
<style scoped>
.fa-sign-out-alt {
    margin-left: 4px;
    margin-top: 1px;
}

.fa-plus,
.fa-minus {
    margin-left: 1px;
    margin-top: 1px;
}

.fa-lock {
    margin-left: 1px;
}
</style>
