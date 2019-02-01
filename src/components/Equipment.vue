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

.btn {
  background: white;
  border: 0px;
  margin: 20px;
  padding: 0px;
  position: absolute;
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  height: 45px;
  width: 45px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  font-size: 0;
  color: #666;
  z-index: 1;
  background-repeat: no-repeat;
  background-position: center center;
}

.btn:hover,
.btn:focus {
  outline: none;
  box-shadow: 0 0 5px 3px #3D91CB;
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

.btn-hand {
  background-size: 60% 60%;
  bottom: 0px;
}

.btn-active {
    background-color: #333;
    box-shadow: 0 0 5px 3px #3D91CB;
}

.btn-gold {
    background-size: 40% 40%;
}
</style>
