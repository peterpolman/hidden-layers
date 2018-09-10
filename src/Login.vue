<template>
  <section class="section-login">
    <h1>{{ title }}</h1>
    <input type="text" v-model="email" placeholder="E-mail">
    <input type="password" v-model="password" placeholder="password">
    <button v-on:click="login">Submit</button>
    <p>you don't have an account? You can <router-link to="/register">register one!</router-link></p>
  </section>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'login',
  data: function () {
    return {
      title: 'Login',
      email: '',
      password: ''
    }
  },
  methods: {
    login: function () {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then(function(user) {
          console.log(user);
          alert('Well done! You are now connected');
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
