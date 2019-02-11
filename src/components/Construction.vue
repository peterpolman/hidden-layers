<template>
<section>

    <button
        v-bind:style="{ backgroundImage: 'url(' + assets.tools + ')' }"
        v-on:click="onToolsClick"
        class="btn btn-tools">
        Tools
    </button>

    <ul class="dialog dialog--construction" v-if="buildingController && open">
        <li :key="item.slug" v-for="item in buildingController.construction">
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
import BuildingController from '../controllers/BuildingController'

export default {
    name: 'construction',
    data() {
        return {
            open: false,
            buildingController: null,
            selectedBuilding: null,
            assets: {
                tools: require('../assets/img/tools.png'),
                house: require('../assets/img/house-4.png'),
            }
        }
    },
    mounted() {
        this.buildingController = new BuildingController()
    },
    methods: {
        onItemClick(item) {
            this.$parent.cursorMode = item.slug
            this.$parent.selectedItem = item
            this.$parent.$refs.equipment.equipment.hand = item
            this.$parent.$refs.equipment.active = true
        },
        onToolsClick() {
            this.$parent.$refs.inventory.open = false
            this.open = !this.open
        },
    }
}
</script>

<style scoped lang="scss">

@import url('../dialog.scss');
@import url('../button.scss');

.dialog--construction {
    width: auto;
    bottom: 145px;
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

.btn-tools {
    bottom: 145px;
    right: 0;
    background-size: 90% 90%;
}

.btn-gold {
    background-size: 40% 40%;
}

</style>
