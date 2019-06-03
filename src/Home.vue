<template>
    <div>
        <Map />
        <Inventory class="ui-inventory" />
        <div class="ui-actions">
            <button v-on:click="reload()" class="btn btn-default">Reload</button>
            <button v-on:click="findMe()" class="btn btn-default">Find me</button>
        </div>
    </div>
</template>

<script>
import Map from './components/Map.vue';
import Inventory from './components/Inventory.vue';
import MarkerService from './services/MarkerService';
import firebase from 'firebase/app';

export default {
    name: 'app',
    components: {
        Map,
        Inventory
    },
    data() {
        return {
            items: null,
            HL: null
        }
    },
    mounted() {
        var markers = new MarkerService;
        markers.load();
    },
    methods: {
        findMe() {
            const MAP = window.MAP;
            const HL = window.HL;
            MAP.setCenter(HL.markers[firebase.auth().currentUser.uid].position);
        },
        reload() {
            location.reload(true);
        }
    }
}
</script>

<style>
html,
body {
    margin: 0;
    height: 100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.ui-wrapper {
}

.ui-actions {
    position: fixed;
    top: .5rem;
    left: .5rem;
}

.ui-inventory {
    position: fixed;
    right: .5rem;
    bottom: .5rem;
}

.btn {
    display: inline-block;
    position: relative;
    margin-right: .5rem;
    text-transform: uppercase;
    border-radius: 2px;
    background: white;
}

.btn-default {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
}

.btn-image {
    width: 40px;
    height: 40px;
    padding: 5px;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: white;
    background-size: 50% 50%;
    font-size: 0;
}

</style>
