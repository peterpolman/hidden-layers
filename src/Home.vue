<template>
  <section class="section-home">
    <h1>{{ title }}</h1>
    <p>Experimental Firebase + Vuejs application</p>
    <h2 v-if="currentUser">Hi {{ currentUser.uid }}</h2>
    <a v-on:click="logout" v-if="currentUser">Logout</a>
  </section>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'home',
  data () {
    return {
      title: 'This is the homepage',
      currentUser: firebase.auth().currentUser
    }
  },
  methods: {
    logout: function() {
      firebase.auth().signOut().then(() => {
        this.$router.replace('login')
      })
    }
  }
}
</script>
