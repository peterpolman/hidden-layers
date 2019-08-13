<template>
<div class="row flex">
    <div class="loader" v-if="loading">Loading...</div>
    <form class="form" v-on:submit.prevent="login" v-if="!loading">
        <h1>Enter your details</h1>
        <div class="form-item">
            <input required type="text" v-model="email" class="input-text" placeholder="E-mail">
        </div>
        <div class="form-item">
            <input required type="password" v-model="password" class="input-text" placeholder="******">
        </div>
        <button class="btn btn-primary" type="submit">Login</button>
        <p class="align-center">you don't have an account? You can <router-link to="/register">register one!</router-link>
        </p>
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
            password: '',
            loading: false
        }
    },
    mounted() {

    },
    methods: {
        login: function() {
            this.loading = true;
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(() => {
                    this.loading = false;
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

<style>

.loader,
.loader:after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
}

.loader {
    position: fixed;
    left: 50%;
    top: 50%;
    margin-top: -61px;
    margin-left: -61px;
    font-size: 10px;
    text-indent: -9999em;
    border-top: 1.1em solid rgba(252, 197, 57, 0.2);
    border-right: 1.1em solid rgba(252, 197, 57, 0.2);
    border-bottom: 1.1em solid rgba(252, 197, 57, 0.2);
    border-left: 1.1em solid #fdc539;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: loading 1.1s infinite linear;
    animation: loading 1.1s infinite linear;
}

@-webkit-keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}

@keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
