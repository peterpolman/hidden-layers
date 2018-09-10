<template>
  <section class="section-login">
    <h1>{{ title }}</h1>
    <form v-on:submit.prevent="login">
      <input type="text" v-model="email" placeholder="E-mail">
      <input type="password" v-model="password" placeholder="password">
      <button type="submit" v-on:click="login">Submit</button>
      <p>you don't have an account? You can <router-link to="/register">register one!</router-link></p>
    </form>
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
        .then( (user) => {
          this.$router.replace('profile')
         })
        .catch( (error) => {
          console.log(error.code + ' ' + error.message);
        }
      );
    }
  }
}
</script>
