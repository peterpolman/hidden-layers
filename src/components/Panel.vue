<template>
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
</template>
<script>
import firebase from 'firebase/app';
import EventService from '../services/EventService';

export default {
    name: 'Panel',
    props: ['items'],
    data() {
        return {
            ea: new EventService(),
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
        const HL = window.HL;

        this.active = HL.selectedItem;
        this.ea.listen('selected.click', this.onSelectedClick)
    },
    methods: {
        onSelectedClick(data) {
            const HL = window.HL;
            const item = data.detail;

            if (this.active && item.slug === this.active.slug) {
                this.$parent.item = this.active = HL.selectedItem = null;
            }
            else if (item.slug !== null) {
                this.$parent.item = this.active = HL.selectedItem = item;

            }
            else {
                this.$parent.item = this.active = null;
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
