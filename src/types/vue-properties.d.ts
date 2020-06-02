import { Store } from 'vuex';

declare module 'vue/types/vue' {
    interface Vue {
        $store: Store<any>;
        $map: any;
        $stage: any;
        $mixers: any;
        $THREE: any;
        $Threebox: any;
        $config: { firebase: any; mapbox: { key: string } };
    }
}
