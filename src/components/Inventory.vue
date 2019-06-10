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
import 'firebase/database';
import Panel from './Panel.vue';
import Vue from 'vue';

export default {
    name: 'Inventory',
    components: {
        Panel
    },
    data() {
        return {
            ref: firebase.database().ref('items').child(firebase.auth().currentUser.uid),
            isOpen: false,
            items: null,
            imgBackpack: require('../assets/img/backpack.png')
        }
    },
    mounted() {
        this.ref.once('value').then(snap => {
            this.items = snap.val();
            console.log('Inventory mounted and items loaded.', this.items)

            this.ref.on('child_added', snap => {
                Vue.set(this.items, snap.key, snap.val());
                console.log('Inventory item added.', snap.val())
            });

            this.ref.on('child_changed', snap => {
                Vue.set(this.items, snap.key, snap.val());
                console.log('Inventory item added.', snap.val())
            });

            this.ref.on('child_removed', snap => {
                Vue.delete(this.items, snap.key);
                console.log('Inventory item remove.', snap.key)
            });
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
        box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    }

    .panel {
        position: absolute;
        right: calc(40px + 20px);
        bottom: 0;
    }

</style>
