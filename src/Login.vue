<template>
    <div class="row flex">
        <form class="form" v-on:submit.prevent="login">
            <h1>Enter your details</h1>
            <div class="form-item">
                <input type="text" v-model="email" class="input-text" placeholder="E-mail">
            </div>
            <div class="form-item">
                <input type="password" v-model="password" class="input-text" placeholder="******">
            </div>
            <button class="btn btn-primary" type="submit">Login</button>
            <p class="align-center">you don't have an account? You can <router-link to="/register">register one!</router-link></p>
        </form>
    </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
    name: 'login',
    data: function() {
        return {
            email: '',
            password: ''
        }
    },
    mounted() {

    },
    methods: {
        login: function() {
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(() => {
                    this.$router.replace('/')
                })
                .catch((err) => {
                    if (typeof err != 'undefined') {
                        console.log(err.code + ' ' + err.message);
                        alert('Error during authentication');
                    }
                });
        }
    }
}
</script>
