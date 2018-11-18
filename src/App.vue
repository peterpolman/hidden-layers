<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<script>
import firebase from 'firebase';

export default {
  data () {
    return {
      currentUser: firebase.auth().currentUser
    }
  }
}
</script>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
    background: #EFEFEF;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

.container {
  width: 100%;
  height: 100%;
}

.section {
  width: 100%;
  height: 100%;
}

h1 {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
}

h2 {
  font-weight: normal;
  font-weight: bold;
  font-size: 1.2rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.section-login h1,
.section-register h1 {
  text-align: center;
}

form {
  width: 220px;
  margin: 0 auto;
  box-sizing: content-box;
}

input[type="text"],
input[type="password"] {
  display: block;
  box-sizing: border-box;
  padding: 1rem;
  border: 0;
  width: 100%;
  margin: 0 auto 1rem;

  & ~ p {
    text-align: center;
    margin: 1rem auto
  }
}

#home-map iframe + div {
  display: none;
}

.gm-style-cc {
  display:none;
}

.btn {
  box-sizing: border-box;
  background: #42b983;
  width: 100%;
  display: block;
  padding: 1rem;
  color: white;
  text-transform: uppercase;
  font-weight: bold;
  border: 0;
  margin: auto;
}

</style>
