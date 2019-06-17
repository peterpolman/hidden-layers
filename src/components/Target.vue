<template>
    <div class="character-wrapper" v-if="target && target.class">
        <div class="character-picture" v-on:click="locate(target.position)">
            <img v-bind:src="img[target.class]" alt="" />
            <small>{{target.level}}</small>
        </div>
        <div class="character-info">
            <strong class="character-name">{{target.name}}</strong><br>
            <div class="bar-wrapper character-hp">
                <div class="bar bar-l" v-bind:style="`background-color: ${((target.hitPoints / (target.level*100) * 100) > 50 ) ? '#8CC63E' : ((target.hitPoints / (target.level*100) * 100) > 25) ? '#FFBB33' : '#ED1C24'}; width: ${(target.hitPoints / (target.level*100) * 100)}%;`"></div>
            </div>
        </div>
    </div>
</template>

<script>
import EventService from '../services/EventService';

export default {
    name: 'Target',
    data() {
        return {
            ea: new EventService(),
            target: null,
            img: {
                knight: require('../assets/img/knight-1.png'),
                archer: require('../assets/img/archer-1.png'),
                wizard: require('../assets/img/wizard-1.png'),
                wolf: require('../assets/img/wolf-0.png'),
                goblin: require('../assets/img/goblin-1.png'),
            }
        }
    },
    mounted() {
        this.ea.listen('target.click', this.onTargetClick)
    },
    methods: {
        onTargetClick(data) {
            const id = data.detail.id;
            const HL = window.HL;

            this.target = HL.markers[id];
        },
        locate(position) {
            const MAP = window.MAP;
            MAP.setCenter(position);
        }
    }

}
</script>

<style>
</style>
