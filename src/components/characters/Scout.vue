<template>
    <div class="profile" v-show="marker.selected">
        <b-button @click="onClick()" class="btn-circle btn-sm">
            <img width="20" :src="img" />
        </b-button>
        <div class="profile-level">{{ marker.lvl }}</div>
        <div class="profile-info">
            <div class="profile-name">
                <strong>{{ marker.name }}</strong>
            </div>
            <div class="profile-progress">
                <b-progress class="profile-hp" variant="success" :value="marker.hp" :max="marker.totalHitpoints" />
            </div>
        </div>
    </div>
</template>
<script src="./Scout.ts" lang="ts"></script>
<style scoped>
.profile {
    position: relative;
    margin-bottom: 1rem;
    max-width: 150px;
}

.profile .profile-name {
    font-size: 14px;
}

.profile .profile-hp {
    height: 5px;
}

.btn-circle.btn-sm {
    flex: 0 45px;
    height: 45px;
}

.profile-level {
    width: 20px;
    height: 20px;
    font-size: 9px;
}
</style>
