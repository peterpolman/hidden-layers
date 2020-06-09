import { Vue } from 'vue-property-decorator';

import App from './App.vue';
import MapboxGL from 'mapbox-gl';

import { ModalPlugin } from 'bootstrap-vue';

import config from './config.json';
import router from './router';
import store from './store';
import firebase from './firebase';
import './registerServiceWorker';
import packageJson from '../package.json';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './style.css';

let app: Vue;

Vue.config.productionTip = false;
Vue.use(ModalPlugin);

firebase.auth.onAuthStateChanged(() => {
    MapboxGL.accessToken = config.mapbox.key;

    Vue.prototype.$version = packageJson.version;

    if (!app) {
        app = new Vue({
            router,
            store,
            render: (h) => h(App),
        }).$mount('#app');
    }
});
