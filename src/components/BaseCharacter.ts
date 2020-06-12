import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import MapboxGL from 'mapbox-gl';

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
    hit: any;
    hitTimer: any;

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
            this.mesh.visible = this.marker.visible;
            console.log(this.marker.visible);
            this.tb.repaint();

            this.$watch('marker.visible', (visible) => {
                this.updateVisibility(visible);
            });

            this.$watch('marker.position', (position) => {
                this.updatePosition(position);
            });

            this.$watch('marker.hitPoints', (newHP: number, oldHP: number) => {
                this.updateHitpoints(newHP, oldHP);
            });

            this.$watch('marker.heading', (heading) => {
                this.updateHeading(heading);
            });
        });
    }

    updateHitpoints(newHP: number, oldHP: number) {
        const el = document.createElement('div');

        el.classList.add(newHP > oldHP ? 'heal' : 'dmg');
        el.classList.add('character-hit');
        el.innerText = (newHP - oldHP).toString();

        if (this.hit) {
            this.hit.remove();
        }

        this.hit = new MapboxGL.Marker(el)
            .setLngLat([this.marker.position.lng, this.marker.position.lat])
            .addTo(this.map);

        this.hitTimer = window.setTimeout(() => {
            this.hit.remove();
            window.clearTimeout(this.hitTimer);
        }, 300);
    }

    updateVisibility(visible: boolean) {
        console.log(visible);
        if (this.tb) {
            this.mesh.visible = visible;
            this.tb.repaint();
        }
    }

    updateHeading(heading: number) {
        this.mesh.rotation.z = heading;
        this.tb.repaint();

        if (this.account.id === this.marker.id) {
            this.miniMap.setBearing(heading);

            if (this.account.lockCamera) {
                this.map.setBearing(heading);
            }
        }
    }

    updatePosition(position: { lat: number; lng: number }) {
        this.mesh.setCoords([position.lng, position.lat]);
        this.tb.repaint();

        this.$emit('update:position', position);

        if (this.account.id === this.marker.id) {
            this.miniMap.setCenter([position.lng, position.lat]);

            if (this.account.lockCamera) {
                this.map.setCenter([position.lng, position.lat]);
            }
        }
    }

    destroyed() {
        this.hit.remove();

        this.tb.remove(this.mesh);
        this.tb.repaint();

        console.log('Character destroyed', this.marker.id);
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
