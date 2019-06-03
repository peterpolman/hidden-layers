<template>
    <div
        class="panel panel-default">
        <ul>
            <li :key="item.key" v-for="item in items">
                <button
                v-bind:class="`btn btn-image btn-${item.slug}`"
                v-bind:style="`background-image: url(${img[item.slug]});`"
                v-on:click="onItemClick(item)">
                    <small>{{ item.amount }}</small>
                </button>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    name: 'Panel',
    props: ['items'],
    data() {
        return {
            img: {
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
    mounted() {

    },
    methods: {
        onItemClick(item) {
            console.log(item);
        }
    }
}
</script>
<style scoped>
    .panel {
        border-radius: 2px;
        margin: auto;
        display: block;
        background: rgba(0,0,0,0.4);
        box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
        padding: 5px;
    }

    .panel ul {
        margin: 0;
        list-style: none;
        padding: 0;
        width: 200px;
    }

    .panel li {
        margin: 5px;
        border-radius: 2px;
        width: 40px;
        height: 40px;
        background-color: rgba(0,0,0,0.5);
        display: inline-block;
    }

</style>
