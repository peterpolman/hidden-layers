import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { Account } from '@/models/Account';

@Component({
    name: 'BaseCharacter',
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
            mixers: 'mixers',
        }),
    },
})
export default class BaseCharacter extends Vue {
    @Prop() img!: string;
    @Prop() marker!: any;
    @Prop() object!: string;

    account!: Account;
    map: any;
    miniMap: any;
    tb: any;
    mixer: any;
    walkCycle: any;
    mesh: any;
    show = false;

    created() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load(this.object, (gltf: any) => {
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

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.$watch('marker.position', (position) => {
                this.updatePosition(position);
            });
        });
    }

    updatePosition(position: any) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();

        this.$emit('update:position', position);

        if (this.account.id === this.marker.id && this.account.lockCamera) {
            this.map.setCenter([position.lng, position.lat]);
            this.miniMap.setCenter([position.lng, position.lat]);
        }
    }

    destroyed() {
        this.tb.remove(this.mesh);
        this.tb.repaint();
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
