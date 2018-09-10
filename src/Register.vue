<template>
  <section class="section-login">
    <h1>{{ title }}</h1>
    <form v-on:submit.prevent="login">
      <input type="text" v-model="email" placeholder="E-mail">
      <input type="password" v-model="password" placeholder="password">
      <button v-on:click="register">Register</button>
      <p>or go back to <router-link to="/login">Login</router-link></p>
    </form>
  </section>
</template>

<script>
import firebase from 'firebase';

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
        .then( (user) => {
          this.$router.replace('profile')
         })
         .then( (err) => {
          console.log(err.code + ' ' + err.message);
        }
      );
    }
  }
}
</script>
