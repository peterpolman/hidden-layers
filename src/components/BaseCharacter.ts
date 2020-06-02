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
    @Prop() img!: string;
    @Prop() character!: any;
    @Prop() object!: string;

    map: any;
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
                id: this.character.id,
                position: this.character.position,
            };

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.walkCycle = this.mixer.clipAction(gltf.animations[0]);
                this.walkCycle.play();

                this.$store.commit('map/addMixer', this.mixer);
            }

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.character.position.lng, this.character.position.lat]);

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.$watch('character.position', (position) => {
                this.updatePosition(position);
            });
        });
    }

    updatePosition(position: any) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();
    }

    onClick() {
        this.map.setCenter([this.character.position.lng, this.character.position.lat]);
    }
}
