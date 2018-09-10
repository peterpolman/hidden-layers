import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase';

import App from './App.vue';
import Home from './Home.vue';
import Login from './Login.vue';
import Register from './Register.vue';
import Users from './Users.vue';
import User from './User.vue';

import config from './config.js';

firebase.initializeApp(config);

Vue.use(VueRouter);

const routes = [
  {
    name: 'user',
    path: '/users/:uid',
    component: User,
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'users',
    path: '/users',
    component: Users,
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'register',
    path: '/register',
    component: Register
  },
  {
    name: 'login',
    path: '/login',
    component: Login
  },
  {
    name: 'home',
    path: '/',
    component: Home
  }
];

const router = new VueRouter({
  routes: routes
});

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
