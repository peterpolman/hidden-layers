<template>
    <div class="row">
        <div class="loader" v-if="loading">Loading...</div>
        <form class="form" v-on:submit.prevent="register" v-if="!loading">
            <h1>Nice to meet you!</h1>
            <h2>Authentication</h2>
            <div class="form-item">
                <input required type="text" v-model="email" class="input-text" placeholder="E-mail">
            </div>
            <div class="form-item">
                <input required type="password" v-model="password" class="input-text" placeholder="******">
            </div>
            <div class="form-item">
                <input required type="password" v-model="passwordVerify" class="input-text" placeholder="******">
            </div>

            <h2>Personal</h2>
            <div class="form-item">
                <input required type="text" v-model="userName" class="input-text" placeholder="Username">
            </div>

            <h2>Hero Race</h2>
            <div class="form-item">
                <input name="race" class="form-radio" id="class-human" type="radio" value="human" v-model="userRace">
                <label for="class-knight">Human</label>
            </div>

            <h2>Hero Class</h2>
            <div class="form-item">
                <input name="class" class="form-radio" id="class-knight" type="radio" value="knight" v-model="userClass">
                <label for="class-knight">Knight</label>
                <input name="class" class="form-radio" id="class-archer" type="radio" value="archer" v-model="userClass">
                <label for="class-archer">Archer</label>
                <input name="class" class="form-radio" id="class-wizard" type="radio" value="wizard" v-model="userClass">
                <label for="class-wizard">Wizard</label>
            </div>

            <h2>Position</h2>
            <div class="form-item" v-if="position">
                Lat: <strong>{{position.latitude}}</strong><br>
                Lng: <strong>{{position.longitude}}</strong>
            </div>
            <div class="form-item" v-if="!position">
                Trying to get your position...
            </div>
            <button v-bind:disabled="!position" class="btn btn-primary" type="submit">Create account</button>
            <p class="align-center">or go back to <router-link to="/login">Login</router-link></p>
        </form>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import GeoService from './services/GeoService';
import MarkerService from './services/MarkerService';
const Geohash = require('latlon-geohash');

export default {
    name: 'register',
    data: function() {
        return {
            email: '',
            password: '',
            passwordVerify: '',
            position: null,
            userName: '',
            userRace: 'human',
            userClass: 'knight',
            loading: false,
        }
    },
    mounted() {
        const geoService = new GeoService();
        geoService.getPosition()
            .then((position) => {
                this.position = position;
            })
            .catch((err) => alert(err));
    },
    methods: {
        register: function() {
            this.loading = true;
            if (this.password === this.passwordVerify) {
                const position = this.position;
                this.createAccount(position);
            }
            else {
                alert("Your passwords do not match.");
            }
        },
        createAccount(position) {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                .then((r) => {
                    const scout = {
                        id: firebase.database().ref('scouts').push().key,
                        uid: r.user.uid,
                        hitPoints: 100,
                        level: 1,
                        name: `${this.userName}'s scout`,
                        race: 'wolf',
                        position: {
                            lat: position.latitude + 0.00001,
                            lng: position.longitude + 0.00001,
                        },
                    }
                    const markerService = new MarkerService();
                    const hashes = markerService.getUniqueHashes(r.user.id, {
                        lat: position.latitude,
                        lng: position.longitude
                    });
                    const user = {
                        hashes: hashes,
                        scout: scout.id,
                        uid: r.user.uid,
                        email: r.user.email,
                        hitPoints: 100,
                        exp: 0,
                        level: 1,
                        race: this.userRace,
                        class: this.userClass,
                        name: this.userName,
                        position: {
                            lat: position.latitude,
                            lng: position.longitude
                        },
                    }
                    const hash = Geohash.encode(user.position.lat, user.position.lng, 7);

                    debugger

                    firebase.database().ref('users').child(user.uid).set(user);
                    firebase.database().ref('scouts').child(scout.id).set(scout);
                    firebase.database().ref('markers').child(hash).child(user.uid).set({
                        position: user.position,
                        race: 'human',
                        ref: `users/${user.uid}`
                    });
                    firebase.database().ref('markers').child(hash).child(scout.id).set({
                        position: scout.position,
                        race: 'wolf',
                        ref: `scouts/${scout.id}`
                    });

                    this.loading = false;
                    this.$router.replace('/');
                })
                .catch((err) => {
                    if (typeof err != 'undefined') {
                        alert("Error during account registration.")
                    }
                    this.loading = false;
                })
        }
    }
}
</script>

<style>
    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
