<template>
<section class="dialog dialog--store" v-if="storeController && storeController.store">
    <header>
        <h2>{{ storeController.stores[storeController.store].name }}</h2>
        <div>
            Category: {{ storeController.stores[storeController.store].category }}<br>
            Owner: {{ $parent.userController.userNames[storeController.stores[storeController.store].owner]  }}
        </div>
        <button v-on:click="onCloseStore">Close</button>
    </header>

    <ul>
        <li :key="item.slug" v-if="(item.amount > 0)" v-for="item in storeController.stores[storeController.store].items">
            <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onGetItemFromStore(storeController.store, item)">
                {{ item.name }}
                <small>
                    {{ item.amount }}
                </small>
            </button>
        </li>
    </ul>
</section>
</template>

<script>
import StoreController from '../controllers/StoreController'

export default {
    name: 'inventory',
    data() {
        return {
            storeController: null,
            selectedItem: null,
            assets: {
                tools: require('../assets/img/tools.png'),
                ward: require('../assets/img/ward-1.png'),
                knight: require('../assets/img/knight-1.png'),
                archer: require('../assets/img/archer-1.png'),
                scout: require('../assets/img/wolf-0.png'),
                gold: require('../assets/img/coin.png'),
                potion: require('../assets/img/potion.png'),
                sword: require('../assets/img/woodSword.png'),
                inventory: require('../assets/img/backpack.png'),
                inventoryOpen: require('../assets/img/backpack_open.png'),
                discover: require('../assets/img/discover.png')
            }
        }
    },
    mounted() {
        this.storeController = new StoreController()
    },
    methods: {

        onGetItemFromStore(id, item) {
            this.$parent.$refs.itemController.inventoryOpen = true
            this.$parent.$refs.inventory.itemController.add(item)
            this.storeController.storesRef.child(id).child('items').child(item.slug).remove()

            setMessage(this.uid, `Picked up ${item.amount} ${item.name} from store`)
        },
        onCloseStore() {
            this.storeController.store = null
        }
    }
}
</script>

<style scoped lang="scss">

.dialog {
    border-radius: 2px;
    position: fixed;
    margin: auto;
    display: block;
    background: rgba(0,0,0,0.4);
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    padding: 5px;
}

.dialog--store {
    bottom: 165px;
    right: 50%;
    margin-right: -100px;
    width: 200px;
    min-height: 50px;
}

.dialog--store header {
    position: absolute;
    background: black;
    top: -61px;
    box-sizing: border-box;
    left: 0;
    color: white;
    padding: 10px;
    padding-right: 20px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    font-size: 10px;
    width: 100%;
    margin: 0;
}

.dialog--store header button {
    background: transparent;
    position: absolute;
    right: 10px;
    top: 5px;
    height: 20px;
    width: 20px;
    font-size: 0;
    border: 0;
    padding: 0;
}

.dialog--store header button:before {
    content: "";
    display: block;
    width: 100%;
    height: 3px;
    background: #EFEFEF;
}

.dialog--store h2 {
    text-transform: uppercase;
    font-size: 12px;
    width: 160px;
    margin: 0 0 5px 0;
    display: block;
    color: white;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

</style>
