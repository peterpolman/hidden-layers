<template>
  <section class="section-login">
    <div class="google-map" id="home-map"></div>
    <h1>Login</h1>
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

import MapService from './services/MapService';
import UserService from './services/UserService';
import MarkerService from './services/MarkerService';

export default {
  name: 'login',
  data: function () {
    return {
      mapService: new MapService,
      userService: new UserService,
      markerService: new MarkerService,
      email: '',
      password: ''
    }
  },
  mounted() {
    this.mapService.init();
  },
  methods: {
    login: function () {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then( (r) => {
          // const data = {
          //   '/status': 1
          // }
          // this.userService.updateUser(r.user.uid, data)
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

<style scoped>
  button {
    margin: 1rem 0;
  }
  .google-map {
    width: 100vw;
    height: 30vh;
    margin: 0 auto;
    background: gray;
  }
</style>
