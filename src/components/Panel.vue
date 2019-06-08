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
import firebase from 'firebase/app';
import Item from '../models/Item';

export default {
    name: 'Panel',
    props: ['items'],
    data() {
        return {
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

    },
    methods: {
        onItemClick(item) {
            const HL = window.HL;
            const data = {
                id: firebase.database().ref('loot').push().key,
                slug: item.slug,
                name: item.name,
                amount: item.amount,
                position: {}
            }

            HL.selected = new Item(data.id, data);
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
        display: flex;
        min-width: 50px;
        min-height: 50px;
    }

    .panel li {
        margin: 5px;
        border-radius: 2px;
        width: 40px;
        height: 40px;
        background-color: rgba(0,0,0,0.5);
        display: inline-block;
        flex: 0 40px;
    }

</style>
