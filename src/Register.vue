<template>
    <div class="row">
        <form class="form" v-on:submit.prevent="register">
            <h1>Nice to meet you!</h1>
            <h2>Authentication</h2>
            <div class="form-item">
                <input type="text" v-model="email" class="input-text" placeholder="E-mail">
            </div>
            <div class="form-item">
                <input type="text" v-model="password" class="input-text" placeholder="******">
            </div>
            <div class="form-item">
                <input type="text" v-model="passwordVerify" class="input-text" placeholder="******">
            </div>

            <h2>Personal</h2>
            <div class="form-item">
                <input type="text" v-model="userName" class="input-text" placeholder="Username">
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

export default {
    name: 'register',
    data: function() {
        return {
            email: '',
            password: '',
            passwordVerify: '',
            userName: '',
            userRace: 'human',
            userClass: '',
        }
    },
    mounted() {

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
                        hitPoints: 100,
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
