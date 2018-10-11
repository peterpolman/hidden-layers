<template>
  <section class="section-profile">
    <h1>{{ currentUser.uid }}</h1>
    <p>{{ currentUser.email }}</p>
    <p>{{ currentUser.metadata.creationTime }}</p>
    <div v-if="position">
      {{ position.coords.latitude }}
      {{ position.coords.longitude }}
    </div>
    {{ weather }}
  </section>
</template>

<script>
import firebase from 'firebase';
import axios from 'axios';
import config from './config.js';

export default {
  name: 'profile',
  data () {
    return {
      currentUser: firebase.auth().currentUser,
      position: null,
      watchID: navigator.geolocation.watchPosition(function(p) {
        this.position = p;
      }.bind(this)),
      weather: this.requestWeather(this.$user)
    }
  },
  methods: {
    requestWeather: function(user) {

    }
  }
}
</script>
