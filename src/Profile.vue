<template>
  <section class="section-profile">
    <h1>{{ currentUser.uid }}</h1>
    <p>{{ currentUser.email }}</p>
    <p>{{ currentUser.metadata.creationTime }}</p>
  </section>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'profile',
  data () {
    return {
      title: 'My Profile',
      currentUser: firebase.auth().currentUser
    }
  }
}
</script>
