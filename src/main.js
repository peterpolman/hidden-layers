import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase/app';
import 'firebase/auth';
import App from './App.vue';
import config from './config.js';

Vue.config.productionTip = false

let app;

firebase.initializeApp(config.firebase);

firebase.auth().onAuthStateChanged(function() {
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
        component: App,
        meta: {
            requiresAuth: true
        }
    }, {
        name: 'login',
        path: '/login',
        // component: Login
    }, {
        name: 'register',
        path: '/register',
        // component: Register
    }
];

const router = new VueRouter({routes: routes});
