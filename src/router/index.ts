import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import firebase from '@/firebase';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'Home',
        path: '/',
        meta: {
            requiresAuth: true,
        },
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        name: 'login',
        path: '/login',
        component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    },
    {
        name: 'logout',
        path: '/logout',
        meta: {
            requiresAuth: true,
        },
        component: () => import(/* webpackChunkName: "logout" */ '../views/Logout.vue'),
    },
    {
        name: 'register',
        path: '/register',
        component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    const currentUser = firebase.auth.currentUser;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !currentUser) {
        next({ name: 'login', query: { redirect: to.path } });
    } else {
        next();
    }
});

export default router;
