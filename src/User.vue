<template>
  <section class="section-user">
    <h1>{{ user.email }}</h1>
    {{ user.metadata.creationTime }}
  </section>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'user',
  data () {
    return {
      title: 'This is the user detail page',
      user: firebase.auth().currentUser
    }
  }
}
</script>
