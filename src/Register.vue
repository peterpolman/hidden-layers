<template>
  <section class="section-login">
    <h1>{{ title }}</h1>
    <input type="text" v-model="email" placeholder="E-mail">
    <input type="password" v-model="password" placeholder="password">
    <button v-on:click="register">Register</button>
    <p>or go back to <router-link to="/login">Login</router-link></p>
  </section>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'register',
  data: function () {
    return {
      email: '',
      password: '',
      title: 'Let\'s create an account'
    }
  },
  methods: {
    register: function () {
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then(function(user) {
          console.log(user);
         })
        .catch(function(error) {
          console.log(error.code + ' ' + error.message);
        });
    }
  }
}
</script>

<style lang="scss">
  input[type="text"],
  input[type="password"] {
    padding: 1rem;
    border: 0;
    display: block;
    width: auto;
    margin:0 auto 1rem;
    min-width: 220px;
    box-sizing: content-box;
  }

  button {
    box-sizing: content-box;
    min-width: 220px;
    background: black;
    display: block;
    padding: 1rem;
    color: white;
    text-transform: uppercase;
    font-weight: bold;
    border: 0;
    margin: auto;
  }
</style>
