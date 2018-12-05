<template>
  <section class="section-login">
    <div class="google-map" id="home-map"></div>
    <h1>Let's create an account</h1>
    <form v-on:submit.prevent="register">

      <h2>Authentication</h2>
      <input required type="text" v-model="email" placeholder="E-mail">
      <input required type="password" v-model="password" placeholder="password">

      <h2>Personal</h2>
      <input required type="text" v-model="username" placeholder="Username">
      <input name="class" id="class-knight" type="radio" value="knight" v-model="userClass">
      <label for="class-knight">Knight</label>
      <input name="class" id="class-archer" type="radio" value="archer" v-model="userClass">
      <label for="class-archer">Archer</label>
      <button  class="btn" type="submit">Register</button>
      <p>or go back to <router-link to="/login">Login</router-link></p>
    </form>
  </section>
</template>

<script>
import firebase from 'firebase'

import MarkerController from './controllers/MarkerController';
import MapBackground from './assets/img/map.png';

export default {
  name: 'register',
  data: function () {
    return {
      markerController: new MarkerController(null),
      email: '',
      password: '',
      userClass: '',
      username: '',
    }
  },
  mounted() {
    document.getElementById('home-map').style.backgroundImage = `url(${MapBackground})`
  },
  methods: {
    register: function () {
      const options = {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 30000
      }

      navigator.geolocation.getCurrentPosition(this.createAccount.bind(this), this.error, options);
    },
    error(err) {
      if (typeof err != 'undefined') {
        console.log(err.code + ' ' + err.message);
        alert('Error during registration');
      }
    },
    createAccount(position) {

      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then( function(r) {
          const data = {
            uid: r.user.uid,
            email: r.user.email,
            position: { lat: position.coords.latitude, lng: position.coords.longitude },
            userClass: this.userClass,
            username: this.username,
          }

          this.markerController.createUser(r.user.uid, data)
          this.$router.replace('/')
        }.bind(this))
        .catch( function(err) {
          if (typeof err != 'undefined') {
            console.log(err.code + ' ' + err.message);
            alert('Error during registration');
          }
        })
    }
  }
}
</script>
