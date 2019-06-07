<template>
    <div>
        <div class="character-wrapper">
            <div class="character-picture" v-on:click="locate(user.position)">
                <img v-bind:src="img[user.class]" alt="" />
                <small>{{user.xp}}</small>
            </div>
            <div class="character-info">
                <strong class="character-name">{{user.name}}</strong><br>
                <div class="bar-wrapper character-hp">
                    <div class="bar bar-l" v-bind:style="`background-color: ${(user.hitPoints > 50 ) ? '#8CC63E' : (user.hitPoints > 25) ? '#FFBB33' : '#ED1C24'}; width: ${user.hitPoints}%;`"></div>
                </div>
                <div class="bar-wrapper character-xp">
                    <div class="bar bar-l" v-bind:style="`background-color: #FFD700; width: ${user.xp}%;`"></div>
                </div>
            </div>
        </div>
        <div class="character-wrapper">
            <div class="character-picture character-picture-s" v-on:click="locate(scout.position)">
                <img v-bind:src="img['wolf']" alt="" />
                <small>{{user.xp}}</small>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase/app';

export default {
    name: 'Profile',
    props: ['user', 'scout'],
    data() {
        return {
            img: {
                knight: require('../assets/img/knight-1.png'),
                archer: require('../assets/img/archer-1.png'),
                wizard: require('../assets/img/wizard-1.png'),
                wolf: require('../assets/img/wolf-0.png')
            }
        }
    },
    mounted() {

    },
    methods: {
        locate(position) {
            const MAP = window.MAP;
            const HL = window.HL;
            MAP.setCenter(position);
        }
    }

}
</script>

<style>
.character-wrapper {
    display: flex;
    align-items: center;
}

.character-picture {
    display: flex;
    position: relative;
    align-items: center;
    background-color: rgba(0,0,0,0.5);
    text-align: center;
    padding: 5px;
    flex: 0 45px;
    width: 45px;
    height: 45px;
    border-radius: 5px;
    border: 3px solid black;
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    margin-right: .5rem;
}

.character-picture small {
    font-weight: bold;
    font-size: 10px;
    color: white;
    padding-top: 2px;
    padding-left: 3px;
    background: black;
    position: absolute;
    bottom: 0;
    right: 0;
    border-top-left-radius: 3px;
}

.character-picture-s {
    flex: 0 35px;
    width: 35px;
    height: 35px;
    margin-top: .5rem;
}

.character-level {
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    border-radius: 50%;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
    background-color: rgba(0,0,0,0.65);
    padding: 5px;
    width: 15px;
    height: 15px;
    line-height: 15px;
    color: white;
    flex: 0 15px;
    margin-right: 5px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
}

.character-picture img {
    margin: auto;
    flex: 0 auto;
    width: auto;
    height: 30px;
}

.character-picture-s img {
    margin: auto;
    flex: 0 auto;
    width: auto;
    height: 30px;
}

.character-name {
    flex: 1 auto;
    font-size: 14px;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.bar-wrapper {
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    width: 100px;
    background-color: rgba(0,0,0,0.5);
    margin-bottom: 5px;
}

.bar {
    height: 5px;
}

.bar.bar-l {
    height: 8px;
}

</style>
