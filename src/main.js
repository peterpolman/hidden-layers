import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase/app';
import 'firebase/auth';

import App from './App.vue';
import Home from './Home.vue';
import Login from './Login.vue';
// import Register from './Register.vue';

import config from './config.js';

let app;

firebase.initializeApp(config.firebase);

firebase.auth().onAuthStateChanged(function(user) {
    console.log(user)
    if (!app) {
        app = new Vue({
            el: '#app',
            render: h => h(App),
            router
        });
    }
});

Vue.use(VueRouter);

const routes = [
    {
        path: '*',
        redirect: '/login'
    }, {
        name: 'home',
        path: '/',
        component: Home,
        meta: {
            requiresAuth: true
        }
    }, {
        name: 'login',
        path: '/login',
        component: Login
    }, {
        name: 'register',
        path: '/register',
        // component: Register
    }
];

const router = new VueRouter({routes: routes});

router.beforeEach((to, from, next) => {
    let currentUser = firebase.auth().currentUser;
    let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !currentUser)
        next('login')
    else
        next()
});
