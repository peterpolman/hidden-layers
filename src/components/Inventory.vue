<template>
    <div>
        <button
            class="btn btn-image btn-toggle"
            v-bind:style="`background-image: url(${(isOpen) ? imgBackpackOpen : imgBackpack});`"
            v-on:click="toggleInventoryOpen()">
            Inventory
        </button>
        <Panel
            v-if="isOpen"
            v-bind:items="items"
            class="panel panel-default panel-inventory" />

        <div class="panel panel-default panel-equiped">
            <ul>
                <li>
                    <button
                    v-if="item"
                    v-bind:class="`btn btn-image btn-${item.slug}`"
                    v-bind:style="`background-image: url(${img[item.slug]});`"
                    v-on:click="onItemClick(item)">
                    </button>
                </li>
            </ul>
        </div>

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
            items: {},
            item: null,
            imgBackpack: require('../assets/img/backpack.png'),
            imgBackpackOpen: require('../assets/img/backpack_open.png'),
            img: {
                tools: require('../assets/img/tools.png'),
                ward: require('../assets/img/ward-1.png'),
                gold: require('../assets/img/coin.png'),
                potion: require('../assets/img/potion.png'),
                sword: require('../assets/img/woodSword.png'),
                discover: require('../assets/img/discover.png'),
            }
        }
    },
    mounted() {
        this.ref.once('value').then(snap => {
            this.items = (snap.val() !== null) ? snap.val() : {};

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
                console.log('Inventory item removed.', snap.key)
            });
        });
    },
    methods: {
        onItemClick() {
            const HL = window.HL;

            if (HL.selectedTarget !== null) {
                HL.selectedTarget.use(HL.selectedItem);
            }
            else {
                HL.user.use(HL.selectedItem);
            }
        },
        toggleInventoryOpen() {
            return this.isOpen = !this.isOpen;
        }
    }
}
</script>

<style scoped>
    .btn-toggle {
        position: absolute;
        background-size: 85% 85%;
        box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
        right: 2px;
        bottom: 75px;
    }

    .panel-inventory {
        position: absolute;
        right: calc(40px + 25px);
        bottom: 65px;
    }

    .panel-equiped {
        position: relative;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        width: 50px;
        height: 50px;
    }

    .panel-equiped ul,
    .panel-equiped ul li,
    .panel-equiped ul li .btn {
        margin: 0;
        border-radius: 50%;
        width: 50px;
        height: 50px;
    }

</style>
