<template>
    <div>
        <Map />
        <div class="actions">
            <button v-on:click="reload()" class="btn btn-default">Reload</button>
            <button v-on:click="findMe()" class="btn btn-default">Find me</button>
        </div>
    </div>
</template>

<script>
import Map from './components/Map.vue';
import MarkerService from './services/MarkerService';
import firebase from 'firebase/app';

export default {
    name: 'app',
    components: {
        Map
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
.actions {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
}
.btn {
    display: inline-block;
    position: relative;
    margin-right: .5rem;
    background: white;
    text-transform: uppercase;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    border-radius: 2px;
    padding: 5px;
}
</style>
