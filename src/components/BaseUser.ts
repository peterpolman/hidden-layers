import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { User } from '@/models/User';
import MapboxGL from 'mapbox-gl';

const ImgAccountClass = {
    wizard: require('../assets/img/wizard-1.png'),
    knight: require('../assets/img/knight-1.png'),
    archer: require('../assets/img/archer-1.png'),
};

@Component({
    name: 'BaseUser',
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
        ...mapGetters('map', {
            tb: 'tb',
            mixers: 'mixers',
        }),
    },
})
export default class BaseUser extends Vue {
    @Prop() user!: User;

    img = ImgAccountClass;
    marker: any;
    mixer: any;
    walkCycleAction: any;
    mesh: any;
    tb: any;

    mounted() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load(`./objects/${this.user.class}/${this.user.class}.gltf`, (gltf: any) => {
            // Remove existing objects with same id
            const objectInScene = this.tb.world.getObjectByName(this.user.uid);
            this.tb.remove(objectInScene);

            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.rotation.z = 180 * 0.0174533;
            gltf.scene.name = this.user.uid;
            gltf.scene.userData = {
                id: this.user.uid,
                position: this.user.position,
            };

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.walkCycleAction = this.mixer.clipAction(gltf.animations[0]);
                this.walkCycleAction.play();

                this.$store.commit('map/addMixer', this.mixer);
            }

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.user.position.lng, this.user.position.lat]);
            this.mesh.name = this.user.uid;

            this.tb.add(this.mesh);
            this.tb.repaint();

            console.log('Object added to world: ', this.user.uid, this.mesh);
            console.log('Object is visible', this.user.uid, this.mesh.visible);
        });

        // const lngLat = [this.user.position.lng, this.user.position.lat];
        // const el = document.createElement('div');
        //
        // el.className = 'marker';
        // this.marker = new MapboxGL.Marker(el).setLngLat(lngLat).addTo(this.map);
    }
}
