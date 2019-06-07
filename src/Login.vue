<template>
    <div>
        <h1>Login</h1>
        <form v-on:submit.prevent="login">
            <input type="text" v-model="email" placeholder="E-mail">
            <input type="password" v-model="password" placeholder="password">
            <button class="btn" type="submit">Submit</button>
            <p>you don't have an account? You can <router-link to="/register">register one!</router-link></p>
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
        console.log('test')
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
