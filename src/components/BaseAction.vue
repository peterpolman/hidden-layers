<template>
    <div class="ui-action">
        <b-button v-if="main" @click="onMainClick()" class="btn-circle">
            <img class="image" :src="require(`../assets/img/${main.image}.png`)" :alt="main.name" />
        </b-button>
        <b-button v-if="off" @click="onOffClick()" class="btn btn-circle" :class="{ 'btn-sm': main }">
            <img class="image" :src="require(`../assets/img/${off.image}.png`)" :alt="off.name" />
        </b-button>
        <div class="action-speed" :class="activated ? 'in' : 'out'">
            <div :style="{ 'transition-duration': `${active ? active.speed : 0}ms` }" class="progress"></div>
        </div>
    </div>
</template>
<script src="./BaseAction.ts" lang="ts"></script>
<style scoped>
.action-speed {
    width: 120px;
    position: fixed;
    bottom: 5rem;
    left: 50%;
    margin-left: -60px;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
    display: block;
    height: 5px;
    overflow: hidden;
    border-radius: 5px;
    opacity: 0;
}
.action-speed .progress {
    background: #fdc539;
    height: 5px;
    display: block;
    position: absolute;
    top: 0px;
    left: 0px;
    transition-duration: 0ms;
}
.action-speed.in {
    opacity: 1;
}
.action-speed.in .progress {
    width: 100%;
    transition-property: width;
    transition-timing-function: linear;
}
.action-speed.out .progress {
    width: 0%;
    transition-property: width;
    transition-timing-function: linear;
    transition-duration: 0ms !important;
}

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
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.5);
}
.btn-circle .image {
    width: 35px;
    height: 35px;
}
.btn-circle.btn-sm {
    width: 40px;
    height: 40px;
    position: absolute;
    bottom: 0;
    left: 50px;
}
.btn-circle.btn-sm .image {
    width: 20px;
    height: 20px;
}
</style>
