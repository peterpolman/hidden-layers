<template>
    <div class="profile" v-show="marker.selected">
        <b-button @click="onClick()" class="btn-circle">
            <img width="30" :src="img" />
        </b-button>
        <div class="profile-level">
            <slot name="level">
                {{ marker.lvl }}
            </slot>
        </div>
        <div class="profile-info">
            <div class="profile-name">
                <strong>
                    {{ marker.name }}
                </strong>
            </div>
            <div class="profile-progress">
                <b-progress class="profile-hp" variant="success" :value="marker.hp" :max="100" />
            </div>
        </div>
    </div>
</template>
<script src="./Scout.ts" lang="ts"></script>
<style scoped>
.profile {
    position: relative;
    margin-bottom: 1rem;
}
</style>
