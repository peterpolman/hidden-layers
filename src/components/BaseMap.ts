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
    map: any;
    tb: any;
    markers!: any;
    tracker = 0;
    position = { lat: 0, lng: 0 };
    options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 };

    async mounted() {
        const position: any = await this.getPosition();

        await this.$store.dispatch('map/init', { container: this.$refs.map, position });

        this.map.on('style.load', () => this.init());
    }

    async init() {
        this.$emit('init');
        this.addLayer();
        this.startTracking();
    }

    addLayer() {
        this.$store.commit('map/addLayer', {
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function(map: any, mbxContext: any) {
                const ambientLight = new THREE.AmbientLight(0xffffff, 1);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
                const tb = new Threebox(map, mbxContext);

                tb.add(ambientLight);
                tb.add(directionalLight);

                // eslint-disable-next-line
                this.$store.commit('map/addThreebox', tb);
            }.bind(this),
            render: function(gl: any, matrix: any) {
                // eslint-disable-next-line
                this.tb.update();
            }.bind(this),
        });
    }

    startTracking() {
        this.tracker = navigator.geolocation.watchPosition(
            this.update,
            err => {
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
