import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '@/models/Account';
import { BButton } from 'bootstrap-vue';
import { Scout } from '@/models/Scout';

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
            scout: 'scout',
        }),
        ...mapGetters('map', {
            map: 'map',
            miniMap: 'miniMap',
            tb: 'tb',
            layers: 'layers',
        }),
        ...mapGetters('markers', {
            markers: 'all',
        }),
    },
})
export default class BaseMap extends Vue {
    account!: Account;
    scout!: Scout;
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
        await this.$store.commit('map/setMap', {
            container: this.$refs.map,
            bearing: this.account.heading,
            center: [this.account.position.lng, this.account.position.lat],
        });

        this.map.dragPan[this.account.lockCamera ? 'disable' : 'enable']();

        this.map.on('style.load', () => this.init());
        this.map.on('click', (e: any) => this.$emit('click', e));
    }

    async init() {
        this.$emit('init');
        this.addLayer();
        this.startTracking();

        this.$store.commit('map/setMiniMap', {
            container: this.$refs.miniMap,
            bearing: this.account.heading,
            center: [this.account.position.lng, this.account.position.lat],
        });
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
                const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
                const tb = new Threebox(map, mbxContext);

                tb.add(ambientLight);

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

                for (const id in this.markers) {
                    if (this.markers[id].position) {
                        const p = this.tb.projectToWorld([
                            this.markers[id].position.lng,
                            this.markers[id].position.lat,
                        ]);
                        const visibleByUser = this.account && this.isVisible(this.account.position, p, 4);
                        const visibleByScout = this.scout && this.isVisible(this.scout.position, p, 3);

                        this.markers[id].visible = visibleByUser || visibleByScout;
                    }
                }

                this.tb.update();
            },
        });
    }

    isVisible(position: { lat: number; lng: number }, v2: any, radius: number) {
        const v1 = this.tb.projectToWorld([position.lng, position.lat]);
        const distanceVector = (vec1: any, vec2: any) => {
            const dx = vec1.x - vec2.x;
            const dy = vec1.y - vec2.y;
            const dz = vec1.z - vec2.z;

            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };

        return distanceVector(v1, v2) < radius;
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
