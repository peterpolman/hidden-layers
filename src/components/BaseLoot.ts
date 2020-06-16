import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { Loot } from '@/models/Loot';
import { Account } from '@/models/Account';

@Component({
    name: 'BaseLoot',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),

        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
            mixers: 'mixers',
        }),
    },
})
export default class BaseLoot extends Vue {
    @Prop() marker!: Loot;
    @Prop() object!: string;

    account!: Account;
    map: any;
    tb: any;
    mixer: any;
    walkCycle: any;
    mesh: any;

    created() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load(`./objects/items/${this.marker.item.slug}.gltf`, (gltf: any) => {
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.rotation.z = 180 * 0.0174533;
            gltf.scene.userData = {
                id: this.marker.id,
                position: this.marker.position,
            };

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.walkCycle = this.mixer.clipAction(gltf.animations[0]);
                this.walkCycle.play();

                this.$store.commit('map/addMixer', this.mixer);
            }

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.marker.position.lng, this.marker.position.lat]);
            this.mesh.rotation.z = Math.floor(Math.random() * 360);

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.$watch('marker.selected', () => this.pickup());
        });
    }

    render() {
        return;
    }

    pickup() {
        this.$store.dispatch('inventory/pickup', { account: this.account, loot: this.marker });
    }

    destroyed() {
        this.tb.remove(this.mesh);
        this.$store.commit('markers/deselect');
        this.tb.repaint();
    }

    updatePosition(position: any) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
