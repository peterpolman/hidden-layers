<template>
    <div>
        <button
            class="btn btn-image btn-toggle"
            v-bind:style="`background-image: url(${imgBackpack});`"
            v-on:click="toggleInventoryOpen()">
            Inventory
        </button>
        <Panel
            v-if="isOpen"
            v-bind:items="items"
            class="" />
    </div>
</template>

<script>
import firebase from 'firebase/app';
import Panel from './Panel.vue';

export default {
    name: 'Inventory',
    components: {
        Panel
    },
    data() {
        return {
            isOpen: false,
            items: [1,2,3,4],
            imgBackpack: require('../assets/img/backpack.png')
        }
    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;

        firebase.database().ref('items').child(uid).once('value').then(snap => {
            this.items = snap.val();
            console.log('Inventory mounted and items loaded.', this.items)
        });
    },
    methods: {
        toggleInventoryOpen() {
            return this.isOpen = !this.isOpen;
        }
    }
}
</script>

<style scoped>
    .btn-toggle {
        bottom: 10px;
        right: 0;
        background-size: contain;
    }
    .panel {
        position: absolute;
        right: calc(40px + 20px);
        bottom: 0;
    }
</style>
