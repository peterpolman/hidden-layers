<template>
    <div
        class="panel panel-default">
        <ul>
            <li :key="item.key" v-for="item in items">
                <button
                v-bind:class="`btn btn-image btn-${item.slug} ${(active !== null && active.slug === item.slug) ? 'active' : ''}`"
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
            active: null,
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
        window.addEventListener('selected.click', this.onSelectedClick)
    },
    methods: {
        onSelectedClick(data) {
            const HL = window.HL;
            
            if (data.detail.id !== null && this.active === null) {
                HL.selected = new Item(data.detail.id, data.detail);
                this.active = HL.selected;
            }
            else if (this.active.slug === data.detail.slug) {
                HL.selected = null;
                this.active = null;
            }
            else {
                this.active = data.detail;
            }
        },
        onItemClick(item) {
            const data = {
                detail: {
                    id: firebase.database().ref('loot').push().key,
                    slug: item.slug,
                    name: item.name,
                    amount: item.amount,
                    position: {}
                }
            };

            return this.onSelectedClick(data)
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
