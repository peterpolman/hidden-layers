<template>
    <div class="profile" v-show="marker.selected">
        <b-button @click="onClick()" class="btn-circle">
            <img width="30" :src="img" />
        </b-button>
        <div class="profile-level">
            <slot name="level">
                ...
            </slot>
        </div>
        <div class="profile-info">
            <div class="profile-name">
                <strong>
                    <slot name="name"></slot>
                </strong>
            </div>
            <div class="profile-progress">
                <slot name="progress"></slot>
            </div>
        </div>
    </div>
</template>
<script src="./BaseCharacter.ts" lang="ts"></script>
<style scoped>
.profile {
    position: relative;
    margin-bottom: 1rem;
}
</style>
