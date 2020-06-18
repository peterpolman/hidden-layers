<template>
    <div class="profile" v-show="marker.selected">
        <b-button @click="onClick()" class="btn-circle">
            <img width="30" :src="img" />
        </b-button>
        <div class="profile-level">{{ marker.lvl }}</div>
        <div class="profile-info">
            <div class="profile-name">
                <strong>Goblin</strong>
            </div>
            <div class="profile-progress">
                <b-progress class="profile-hp" variant="success" :value="marker.hp" :max="marker.totalHitpoints" />
            </div>
        </div>
    </div>
</template>
<script src="./Goblin.ts" lang="ts"></script>
<style>
.profile {
    position: relative;
    margin-bottom: 1rem;
}
.image {
    width: auto;
    height: 25px;
}
.speech-bubble {
    width: auto;
    max-width: 200px;
    padding: 0.5rem;
    font-family: 'Alice';
    color: #d19a66;
    font-size: 0.85rem;
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.75);
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    line-height: 1.2;
}
</style>
