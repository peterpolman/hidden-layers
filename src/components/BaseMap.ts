import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';
import { BButton } from 'bootstrap-vue';

const THREE = (window as any)['THREE'];
const Threebox = (window as any)['Threebox'];

@Component({
    name: 'BaseMap',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters('map', {
            map: 'map',
            miniMap: 'miniMap',
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
    miniMap: any;
    tb: any;
    markers!: any;
    tracker = 0;
    position = { lat: 0, lng: 0 };
    options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 };
    clock: any;
    ne!: any;
    sw!: any;

    async mounted() {
        await this.$store.dispatch('map/init', { container: this.$refs.map, position: this.account.position });

        this.map.on('style.load', () => this.init());
        this.map.on('click', (e: any) => this.$emit('click', e));
    }

    async init() {
        this.$emit('init');
        this.addLayer();
        this.startTracking();

        this.$store.commit('map/setMiniMap', { container: this.$refs.miniMap, position: this.account.position });
    }

    zoomIn() {
        this.miniMap.zoomIn({ duration: 400 });
    }

    zoomOut() {
        this.miniMap.zoomOut({ duration: 400 });
    }

    logout() {
        this.$router.replace('logout');
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
            render: () => {
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

    async toggleLockCamera() {
        await this.$store.dispatch('account/toggleLockCamera');
        this.map.dragPan[this.account.lockCamera ? 'disable' : 'enable']();
        this.map.setCenter([this.account.position.lng, this.account.position.lat]);
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

    async updatePosition(r: { coords: any }) {
        await this.$store.dispatch('account/setPosition', {
            account: this.account,
            heading: r.coords.heading || this.account.heading,
            position: {
                lat: r.coords.latitude,
                lng: r.coords.longitude,
            },
        });
    }
}
