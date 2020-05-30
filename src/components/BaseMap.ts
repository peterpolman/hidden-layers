import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';

const THREE = (window as any)['THREE'];
const Threebox = (window as any)['Threebox'];

@Component({
    name: 'BaseMap',
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
            layers: 'layers',
        }),
        ...mapGetters('markers', {
            markers: 'visible',
        }),
    },
})
export default class BaseMap extends Vue {
    account!: Account;
    mixers!: any;
    map: any;
    tb: any;
    markers!: any;
    tracker = 0;
    position = { lat: 0, lng: 0 };
    options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 };
    clock: any;

    async mounted() {
        const position: any = await this.getPosition();

        await this.$store.dispatch('map/init', { container: this.$refs.map, position });

        this.map.on('style.load', () => this.init());
        this.map.on('click', (e: any) => this.$emit('click', e));
    }

    async init() {
        this.$emit('init');
        this.addLayer();
        this.startTracking();
    }

    addLayer() {
        this.clock = new THREE.Clock();
        this.$store.commit('map/addLayer', {
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map: any, mbxContext: any) => {
                const ambientLight = new THREE.AmbientLight(0xffffff, 1);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
                const tb = new Threebox(map, mbxContext);

                tb.add(ambientLight);
                tb.add(directionalLight);

                this.$store.commit('map/addThreebox', tb);
            },
            render: (gl: any, matrix: any) => {
                const delta = this.clock.getDelta();

                if (this.mixers) {
                    this.mixers.forEach((mixer: any) => {
                        mixer.update(delta);
                        this.tb.repaint();
                    });
                }

                this.tb.update();
            },
        });
    }

    startTracking() {
        this.tracker = navigator.geolocation.watchPosition(
            this.updatePosition,
            (err) => {
                console.error(err);
            },
            this.options,
        );
    }

    stopTracking() {
        navigator.geolocation.clearWatch(this.tracker);
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (r) => {
                    resolve({ lat: r.coords.latitude, lng: r.coords.longitude });
                },
                (err) => {
                    reject(err.message);
                },
                this.options,
            );
        });
    }

    async updatePosition(r: { coords: any }) {
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
