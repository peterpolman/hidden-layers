<template>
    <div>
        <base-map @click="onMapClick($event)" />
        <base-fog v-if="tb && account" :account="account" />

        <div class="map-ui" v-if="map">
            <base-profile />
            <base-inventory />
            <base-action :main="equipment.main" :off="equipment.off" :target="selected" />

            <div class="nearby">
                <component :is="marker.race" v-for="marker of all" :character="marker" :key="marker.id" />
            </div>
        </div>
    </div>
</template>

<script src="./Home.ts" lang="ts"></script>

<style>
.btn {
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);
}

.btn-square {
    width: 50px;
    height: 50px;
    position: relative;
    border-radius: 4px;
    margin: 0.25rem;
    background: white;
    border: 1px solid #efefef;
}

.btn-square .amount {
    width: auto;
    height: 16px;
    background: black;
    color: white;
    padding: 0.25rem;
    font-weight: bold;
    line-height: 0;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -1px;
    bottom: -1px;
    border-top-left-radius: 4px;
    border-bottom-right-radius: 4px;
}

.btn-square:hover,
.btn-square:focus,
.btn-square:focus:hover {
    background-color: white !important;
    box-shadow: 0;
}

.btn-square.active {
    box-shadow: 0 0 0 3px #d19a66;
}

.btn-primary,
.btn-success {
    font-family: 'Alice';
    letter-spacing: 1px;
    text-transform: uppercase;
    border: 0;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    height: 21px;
    padding: 0 0.5rem;
    opacity: 1;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    position: relative;
    font-size: 10px;
}

.btn-primary {
    background-color: #650703 !important;
    color: #d19a66;
}

.btn-success {
    background-color: #cb9500 !important;
    color: #650703;
}

.btn-primary span,
.btn-success span {
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
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

.popover {
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0.75);
    border: 1px solid #666;
    border-radius: 5px;
    overflow: visible;
    width: 200px;
}

.popover .arrow {
    display: none;
}
.popover .popover-header,
.popover .popover-body {
    background-color: transparent;
    color: white;
    border: 0;
}
.popover .popover-header {
    font-size: 14px;
    padding: 0.5rem;
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.popover .popover-body {
    padding: 0 0.5rem 0.5rem 0.5rem;
    font-size: 12px;
}
</style>
