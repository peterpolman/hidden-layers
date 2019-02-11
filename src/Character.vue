<template>
    <main class="section-character">
        <section class="dialog dialog--store" v-if="storeController && storeController.store">
            <ul>
                <li :key="item.slug" v-if="item.amount > 0" v-for="item in storeController.stores[storeController.store].items">
                    <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onGetItemFromStore(storeController.store, item)">
                        {{ item.name }}
                        <small>
                            {{ item.amount }}
                        </small>
                    </button>
                </li>
            </ul>
        </section>
        <section class="section-equipment">
            equip
        </section>
        <section class="section-inventory">
            inventory
        </section>
    </main>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

import StoreController from './controllers/StoreController'
// import InventoryController from './controllers/InventoryController'

export default {
    name: 'inventory',
    data: function() {
        return {
            uid: firebase.auth().currentUser.uid,
            storeController: null,
            selectedItem: null,
            assets: {
                tools: require('./assets/img/tools.png'),
                ward: require('./assets/img/ward-1.png'),
                knight: require('./assets/img/knight-1.png'),
                archer: require('./assets/img/archer-1.png'),
                scout: require('./assets/img/wolf-0.png'),
                gold: require('./assets/img/coin.png'),
                potion: require('./assets/img/potion.png'),
                sword: require('./assets/img/woodSword.png'),
                inventory: require('./assets/img/backpack.png'),
                inventoryOpen: require('./assets/img/backpack_open.png'),
                discover: require('./assets/img/discover.png')
            }
        }
    },
    mounted() {
        this.storeController = new StoreController()
        // this.itemController = new ItemController()
    },
    methods: {

    }
}
</script>

<style scoped lang="scss">
@import url('./dialog.scss');
$blue-dark: #2c3e50;

.section-character {
    background: $blue-dark;
    height: 100%;
    width: 100%;
    color: white;
    padding: 1rem;
}

</style>
