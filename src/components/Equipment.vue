<template>
    <button
    v-if="equipment.hand"
    v-bind:style="{ backgroundImage: 'url(' + ( (equipment.hand != null) ? assets[equipment.hand.slug] : assets.hand )+ ')' }"
    v-on:click="onEquippedItemClick"
    :class="`btn btn-hand btn-${equipment.hand.slug} ${(active) ? 'btn-active' : ''}`">
        Equipment
    </button>
</template>

<script>
import ItemController from '../controllers/ItemController'

export default {
    name: 'equipment',
    data() {
        return {
            equipment: {
                hand: null,
            },
            active: false,
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
                discover: require('../assets/img/discover.png'),
                house: require('../assets/img/house-4.png'),
            }
        }
    },
    methods: {
        onEquippedItemClick() {
            this.active = true
            this.$parent.selectedItem = this.equipment.hand
            this.$parent.cursorMode = this.equipment.hand.slug
        }
    }
}
</script>

<style scoped lang="scss">

@import url('../button.scss');

.btn-hand {
  background-size: 60% 60%;
  bottom: 0px;
}

.btn-active {
    border-radius: 50%;
    bottom: .5rem;
    left: .5rem;
    width: 50px;
    height: 50px;
    background-color: #333;
    box-shadow: 0 0 5px 3px #3D91CB;
}

.btn-gold {
    background-size: 40% 40%;
}
</style>
