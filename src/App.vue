<template>
  <div class="container">
    <nav>
      <router-link to="/home">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
      <router-link to="/users">Users</router-link>
      <router-link :to="{ name: 'user', params: { uid: 1 }}">User 1</router-link>
      <router-link :to="{ name: 'user', params: { uid: 2 }}">User 2</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data () {
    return {
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
  max-width: 1200px;
  width: auto;
  margin: auto;
  padding: 0 .5rem;
}

nav {
  background: #EFEFEF;
  border-bottom: 1px solid #999;
  color: white;
  width: auto;
  display: block;
  padding: 1rem;
  text-align: center;
  margin: 0 -.5rem;
}

h1, h2 {
  font-weight: normal;
  text-align: center;
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
</style>
