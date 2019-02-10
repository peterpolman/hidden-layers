<template>
<section>

    <button
        v-if="(itemController && itemController.inventory)"
        v-bind:style="{ backgroundImage: 'url(' + ( (itemController.inventoryOpen) ? assets.inventoryOpen : assets.inventory )+ ')' }"
        v-on:click="onInventoryClick"
        class="btn btn-inventory">
        Inventory
    </button>

    <ul class="dialog dialog--inventory" v-if="itemController && itemController.inventoryOpen">
        <li :key="item.slug" v-if="(item.amount > 0)" v-for="item in itemController.inventory">
            <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onItemClick(item)">
                {{ item.name }}
                <small v-if="(item.amount > 1)">
                    {{ item.amount }}
                </small>
            </button>
        </li>
    </ul>

</section>
</template>

<script>
import ItemController from '../controllers/ItemController'

export default {
    name: 'inventory',
    data() {
        return {
            itemController: null,
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
        this.itemController = new ItemController()
    },
    methods: {
        onItemClick(item) {
            this.$parent.cursorMode = 'drop'
            this.$parent.$refs.equipment.equipment.hand = item

            if (this.$parent.selectedItem == item) {
                this.$parent.$refs.equipment.active = true
                this.$parent.cursorMode = this.$parent.selectedItem.slug
            } else {
                this.$parent.selectedItem = item
                this.$parent.$refs.equipment.active = false
            }
        },
        onInventoryClick() {
            this.itemController.inventoryOpen = !this.itemController.inventoryOpen
        },
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
}

.dialog--inventory {
    width: auto;
    bottom: 95px;
    height: 40px;
    right: 60px;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 10px 0;

    li {
        margin: 0 10px 0 0;
        border-radius: 2px;
        width: 40px;
        height: 40px;
        display: inline-flex;

        &:first-child {
            margin-left: 10px;
        }

        .btn {
            margin: 0;
        }
    }
}

.btn {
    background: white;
    border: 0;
    margin: 10px;
    padding: 0;
    position: absolute;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
    height: 40px;
    width: 40px;
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    font-size: 0;
    color: #666;
    width: 40px;
    height: 40px;
    z-index: 1;
    background-size: 80% 80%;
    background-repeat: no-repeat;
    background-position: center center;
}

.btn:focus,
.btn:hover {
    outline: none;
    box-shadow: 0 0 5px 2px #3D91CB;
}

.btn:active {
    opacity: 0.8;
}

.btn small {
    position: absolute;
    z-index: 1;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.75);
    color: white;
    font-size: 7px;
    padding: 2px 3px;
    border-top-left-radius: 2px;
}

.btn-inventory {
    bottom: 95px;
    right: 0;
    background-size: 90% 90%;
}

.btn-gold {
    background-size: 40% 40%;
}

</style>
