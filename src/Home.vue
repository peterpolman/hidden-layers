<template>
    <div>
        <Map />
        <Panel class="actions" items="items" />
    </div>
</template>

<script>
import Map from './components/Map.vue';
import Panel from './components/Panel.vue';

import MarkerService from './services/MarkerService';

export default {
    name: 'app',
    components: {
        Map,
        Panel
    },
    data() {
        return {
            items: [1,2,3,4,5]
        }
    },
    mounted() {
        var markers = new MarkerService;
        markers.load();
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
</style>
