<template>
    <div class="ui-action">
        <b-button v-if="main" @click="onMainClick()" class="btn-circle" :class="{ active: main.active }">
            <img class="image" :src="img[main.slug]" :alt="main.name" />
        </b-button>
        <b-button
            v-if="off"
            @click="onOffClick()"
            class="btn btn-circle"
            :class="{ 'btn-sm': main, 'active': off.active }"
        >
            <img class="image" :src="img[off.slug]" :alt="off.name" />
        </b-button>
    </div>
</template>
<script src="./BaseAction.ts" lang="ts"></script>
<style scoped>
.ui-action {
    bottom: 1rem;
    left: 1rem;
    position: fixed;
}
.btn-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0.25rem;
    background: white;
    border: 1px solid #efefef;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-circle .image {
    width: 35px;
    height: 35px;
}
.btn-circle.btn-sm {
    width: 30px;
    height: 30px;
    position: absolute;
    bottom: 0;
    left: 50px;
}

.btn-circle.btn-sm .image {
    display: block;
    width: 20px;
    height: 20px;
}
</style>
