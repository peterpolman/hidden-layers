<template>
  <section class="section-login">
    <h1>{{ title }}</h1>
    <form v-on:submit.prevent="login">
      <input type="text" v-model="email" placeholder="E-mail">
      <input type="password" v-model="password" placeholder="password">
      <button type="submit">Submit</button>
      <p>you don't have an account? You can <router-link to="/register">register one!</router-link></p>
    </form>
  </section>
</template>

<script>
import firebase from 'firebase';
import AuthService from './services/AuthService';

export default {
  name: 'login',
  data: function () {
    return {
      title: 'Login',
      email: '',
      password: '',
      db: firebase.database()
    }
  },
  methods: {
    login: function () {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then( (r) => {
          const usersRef = this.db.ref('users');
          usersRef.child(r.user.uid).update({
            status: 1
          });
          this.$router.replace('/')
         })
        .catch( (err) => {
          if (typeof err != 'undefined') {
            console.log(err.code + ' ' + err.message);
            alert('Error during authentication');
          }
        }
      );
    }
  }
}
</script>
