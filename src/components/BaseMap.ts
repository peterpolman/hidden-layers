import { Component, Vue } from 'vue-property-decorator';
import MapboxGL from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseMap',
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
    },
})
export default class BaseMap extends Vue {
    account!: any;
    position = { lat: 0, lng: 0 };
    map: any;
    tracker = 0;
    options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 };

    async mounted() {
        const position: any = await this.getPosition();

        this.map = new MapboxGL.Map({
            container: 'map',
            style: require('../assets/style-dark.json'),
            zoom: 19,
            maxZoom: 21,
            minZoom: 16,
            center: [position.lng, position.lat],
            pitch: 75,
            bearing: 45,
            antialias: true,
            doubleClickZoom: false,
            pitchWithRotate: false,
            touchZoomRotate: false,
            scrollZoom: true,
            boxZoom: false,
            dragRotate: true,
        });

        this.map.on('load', this.init);
    }

    async init() {
        this.start();
        this.$emit('init', this.map);
    }

    start() {
        this.tracker = navigator.geolocation.watchPosition(
            this.update,
            err => {
                console.error(err);
            },
            this.options,
        );
    }

    stop() {
        navigator.geolocation.clearWatch(this.tracker);
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                r => {
                    resolve({ lat: r.coords.latitude, lng: r.coords.longitude });
                },
                err => {
                    reject(err.message);
                },
                this.options,
            );
        });
    }

    async update(r: { coords: any }) {
        if (this.account) {
            await this.$store.dispatch('account/setPosition', {
                account: this.account,
                position: {
                    lat: r.coords.latitude,
                    lng: r.coords.longitude,
                },
            });
        }
    }
}
