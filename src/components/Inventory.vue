<template>
<section>

    <button
        v-if="(itemController && itemController.inventory)"
        v-bind:style="{ backgroundImage: 'url(' + ( (open) ? assets.inventoryOpen : assets.inventory )+ ')' }"
        v-on:click="onInventoryClick"
        class="btn btn-inventory">
        Inventory
    </button>

    <ul class="dialog dialog--inventory" v-if="itemController && open">
        <li :key="item.slug" v-if="(item.amount > 0)" v-for="item in itemController.inventory">
            <button v-bind:style="{ backgroundImage: `url(${assets[item.slug]})` }" v-bind:class="`btn btn-${item.slug}`" v-on:click="onItemClick(item)">
                {{ item.name }}
                <small v-if="(item.amount > 1)">
                    {{ item.amount }}
                </small>
            </button>
        </li>
        <!-- <li>
            <button v-on:click="openInventory()" class="btn">more</button>
        </li> -->
    </ul>

</section>
</template>

<script>
import ItemController from '../controllers/ItemController'

export default {
    name: 'inventory',
    data() {
        return {
            open: false,
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
        openInventory() {
            this.$router.replace('/inventory')
        },
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
            this.$parent.$refs.construction.open = false
            this.open = !this.open
        },
    }
}
</script>

<style scoped lang="scss">

@import url('../dialog.scss');
@import url('../button.scss');

.dialog--inventory {
    width: auto;
    bottom: 95px;
    min-height: 50px;
    right: 60px;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 5px;
    overflow: auto;

    li {
        margin: 5px;
        border-radius: 2px;
        width: 40px;
        height: 40px;
        display: inline-flex;

        .btn {
            margin: 0;
        }
    }
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
