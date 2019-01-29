<template>
<section class="section-login">
    <div class="google-map" id="home-map"></div>
    <h1>Let's create an account</h1>
    <form v-on:submit.prevent="register">

        <h2>Authentication</h2>
        <input required type="text" v-model="email" placeholder="E-mail">
        <input required type="password" v-model="password" placeholder="password">

        <h2>Personal</h2>
        <input required type="text" v-model="username" placeholder="Username">

        <h2>Hero Class</h2>
        <div class="form-item">
            <input name="class" class="form-radio" id="class-knight" type="radio" value="knight" v-model="userClass">
            <label for="class-knight">Knight</label>
            <input name="class" class="form-radio" id="class-archer" type="radio" value="archer" v-model="userClass">
            <label for="class-archer">Archer</label>
        </div>
        <div class="form-item" v-if="alert">
            {{ alert }}
        </div>
        <button class="btn" type="submit">Register</button>
        <p>or go back to <router-link to="/login">Login</router-link>
        </p>
    </form>
</section>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

import UserController from './controllers/UserController';
import MapBackground from './assets/img/map.png';

export default {
    name: 'register',
    data: function() {
        return {
            email: '',
            password: '',
            userClass: '',
            username: '',
            alert: ''
        }
    },
    mounted() {
        document.getElementById('home-map').style.backgroundImage = `url(${MapBackground})`
    },
    methods: {
        register: function() {
            const options = {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 30000
            }
            this.alert = "Processing location data."
            navigator.geolocation.getCurrentPosition(this.createAccount, this.error, options);
        },
        error(err) {
            if (typeof err != 'undefined') {
                this.alert = 'Error during processing location data.'
            }
        },
        createAccount(position) {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                .then((r) => {
                    const data = {
                        uid: r.user.uid,
                        email: r.user.email,
                        position: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        userClass: this.userClass,
                        username: this.username,
                    }

                    new UserController(r.user.uid).createUser(r.user.uid, data)
                    this.$router.replace('/')
                })
                .catch((err) => {
                    if (typeof err != 'undefined') {
                        this.alert = "Error during account registration."
                        console.log(err)
                        alert(err)
                    }
                })
        }
    }
}
</script>
