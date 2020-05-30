import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';

@Component({
    name: 'BaseCharacter',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('map', {
            map: 'map',
            tb: 'tb',
            mixers: 'mixers',
        }),
    },
})
export default class BaseCharacter extends Vue {
    @Prop() id!: string;
    @Prop() img!: string;
    @Prop() position!: { lng: number; lat: number };
    @Prop() object!: string;
    @Prop() show!: boolean;

    map: any;
    tb: any;
    mixer: any;
    walkCycle: any;
    mesh: any;

    mounted() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load(this.object, (gltf: any) => {
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.rotation.z = 180 * 0.0174533;
            gltf.scene.userData = {
                id: this.id,
                position: this.position,
            };

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.walkCycle = this.mixer.clipAction(gltf.animations[0]);
                this.walkCycle.play();

                this.$store.commit('map/addMixer', this.mixer);
            }

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.position.lng, this.position.lat]);

            this.tb.add(this.mesh);
            this.tb.repaint();
        });
    }

    onClick() {
        this.map.setCenter([this.position.lng, this.position.lat]);
    }
}
