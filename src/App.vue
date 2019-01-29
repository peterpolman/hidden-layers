<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

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
  font-size: 14px;

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

.google-map {
  width: 100vw;
  height: 25vh;
  margin: 0 auto;
  background: gray;
  background-size: cover;
}

.form-item {
    position: relative;
    margin-bottom: 1rem;
}

.form-radio + label {
  min-height: 20px;
  padding-left: calc(20px + .5rem);
  margin-bottom: 0;
  font-weight: normal;
  cursor: pointer;
  position: relative;
  margin-right: 1rem;

  &:before {
    position: absolute;
    content: '';
    display: block;
    width: 18px;
    height: 18px;
    left: 0;
    top: 0;
    border-radius: 3px;
    border: 2px solid #2c3e50;
    background-color: transparent;
    transition: .2s background-color ease;
  }

  &:after {
    box-sizing: content-box;
    position: absolute;
    content: '';
    display: block;
    opacity: 0;
    transition: .2s opacity ease;
  }
}

.form-radio {
  position: absolute;
  opacity: 0;

  &:focus + label:before {
    border: 2px solid #2c3e50;
  }

  &:checked + label:before,
  &:checked:focus + label:before{
    border-color: #2c3e50;
    background-color: white;
  }

  &:checked + label:after {
    opacity: 1;
    transform: scale(1);
  }
}

.form-radio + label {
  &:before {
    border-radius: 50%;
  }

  &:after {
    background-color: #2c3e50;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    top: 4px;
    left: 4px;
    border: 0;
  }
}

</style>
