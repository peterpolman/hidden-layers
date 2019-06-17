<template>
    <div class="row flex-md">
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

            <button class="btn btn-primary" type="submit">Create account</button>
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
            disabled: false,
            email: '',
            password: '',
            passwordVerify: '',
            userName: '',
            userRace: 'human',
            userClass: 'knight',
            loading: false,
        }
    },
    mounted() {

    },
    methods: {
        register: function() {
            this.loading = true;
            if (this.password === this.passwordVerify) {
                const geoService = new GeoService();
                geoService.getPosition()
                    .then((position) => this.createAccount(position))
                    .catch((err) => alert(err));
            }
            else {
                alert("Your passwords do not match.");
            }
        },
        createAccount(position) {
            if (this.disabled) {
                alert("Account creation is temporarily disabled. Send an e-mail to peter@peterpolman.nl to apply for the waiting list.");
            }
            else {
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                    .then((r) => {
                        const scout = {
                            id: firebase.database().ref('scouts').push().key,
                            uid: r.user.uid,
                            hitPoints: 100,
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
                            race: this.userRace,
                            class: this.userClass,
                            name: this.userName,
                            position: {
                                lat: position.latitude,
                                lng: position.longitude
                            },
                        }
                        const hash = Geohash.encode(user.position.lat, user.position.lng, 7);

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
}
</script>
