<template>
    <button class="btn-square">
        <img class="image" :src="img[user.class]" :alt="user.class" />
        <small>{{ user.name }}</small>
    </button>
</template>
<script src="./BaseUser.ts" lang="ts"></script>
<style>
.image {
    width: auto;
    height: 25px;
}
</style>
