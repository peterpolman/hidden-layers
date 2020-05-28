import { Store } from 'vuex';

declare module 'vue/types/vue' {
    interface Vue {
        $store: Store<any>;
        $map: any;
        $config: { firebase: any; mapbox: { key: string } };
    }
}
