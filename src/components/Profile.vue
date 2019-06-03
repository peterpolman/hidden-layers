<template>
    <div class="user-wrapper">
        <div class="user-picture" v-on:click="locateUser()">
            <img v-bind:src="img[user.userClass]" alt="" />
            <small>{{user.xp}}</small>
        </div>
        <div class="user-info">
            <strong class="user-name">{{user.userName}}</strong><br>
            <div class="bar-wrapper user-hp">
                <div class="bar" v-bind:style="`background-color: ${(user.hitPoints > 50 ) ? '#8CC63E' : (user.hitPoints > 25) ? '#FFBB33' : '#ED1C24'}; width: ${user.hitPoints}px;`"></div>
            </div>
            <div class="bar-wrapper user-xp">
                <div class="bar" v-bind:style="`background-color: #FFD700; width: ${user.xp}px;`"></div>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase/app';

export default {
    name: 'Profile',
    props: ['user'],
    data() {
        return {
            img: {
                knight: require('../assets/img/knight-1.png'),
                archer: require('../assets/img/archer-1.png'),
                wizard: require('../assets/img/wizard-1.png')
            }
        }
    },
    mounted() {

    },
    methods: {
        locateUser() {
            const MAP = window.MAP;
            const HL = window.HL;
            MAP.setCenter(HL.markers[firebase.auth().currentUser.uid].position);
        }
    }

}
</script>

<style>
.user-wrapper {
    display: flex;
    align-items: center;
}

.user-picture {
    display: flex;
    position: relative;
    align-items: center;
    background-color: rgba(0,0,0,0.5);
    text-align: center;
    padding: 5px;
    flex: 0 50px;
    width: 50px;
    height: 50px;
    border-radius: 5px;
    border: 3px solid white;
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    margin-right: .5rem;
}

.user-picture small {
    font-weight: bold;
    font-size: 10px;
    color: #333;
    padding-top: 2px;
    padding-left: 3px;
    background: white;
    position: absolute;
    bottom: 0;
    right: 0;
    border-top-left-radius: 3px;
}

.user-picture-s {
    width: 40px;
    height: 40px;
    border: 0;
    background-color: rgba(0,0,0,0.5);
}

.user-picture img {
    margin: auto;
    flex: 0 40px;
    width: 40px;
}

.user-picture-s img {
    flex: 0 30px;
    width: 30px;
}

.user-name {
    flex: 1 auto;
    font-size: 14px;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.bar-wrapper {
    box-shadow: rgba(0, 0, 0, 0.3) 0 1px 4px -1px;
    width: 100px;
    background: rgba(0,0,0,0.5);
    margin-bottom: 5px;
}

.bar {
    height: 8px;
}

</style>
