<template>
  <section class="section-login">
    <h1>Let's create an account</h1>
    <form v-on:submit.prevent="register">

      <h2>Authentication</h2>
      <input required type="text" v-model="email" placeholder="E-mail">
      <input required type="password" v-model="password" placeholder="password">

      <h2>Personal</h2>
      <input required type="text" v-model="username" placeholder="Username">
      <input name="gender" id="gender-male" type="radio" value="male" v-model="gender">
      <label for="gender-male">Male</label>
      <input name="gender" id="gender-female" type="radio" value="female" v-model="gender">
      <label for="gender-female">Female</label>
      <button type="submit">Register</button>
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
      gender: '',
      username: '',
      db: firebase.database()
    }
  },
  methods: {
    register: function () {
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then( (r) => {
          const usersRef = this.db.ref('users');
          usersRef.child(r.user.uid).set({
            email: r.user.email,
            gender: this.gender,
            username: this.username,
          });

          this.$router.replace('/')
        })
        .then( (err) => {
          if (typeof err != 'undefined') {
            console.log(err.code + ' ' + err.message);
            alert('Error during registration');
          }
        }
      );
    }
  }
}
</script>

<style>
button {
  margin: 1rem 0;
}
</style>
