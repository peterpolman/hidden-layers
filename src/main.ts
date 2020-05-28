import { Vue } from 'vue-property-decorator';

import App from './App.vue';
import MapboxGL from 'mapbox-gl';

// import VueTimers from 'vue-timers';
// import VueMoment from 'vue-moment';
import { ModalPlugin } from 'bootstrap-vue';

import './registerServiceWorker';
import router from './router';
import store from './store';
import config from './config.json';

import firebase from './firebase';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.config.productionTip = false;

// Vue.use(VueTimers);
// Vue.use(VueMoment);
Vue.use(ModalPlugin);

firebase.auth.onAuthStateChanged((user: firebase.User | any) => {
    MapboxGL.accessToken = config.mapbox.key;

    Vue.prototype.$map = null;

    new Vue({
        router,
        store,
        render: h => h(App),
    }).$mount('#app');
});
