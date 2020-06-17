import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Ward } from '@/models/Ward';

@Component({
    name: 'MarkerWard',
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
export default class MarkerWard extends Vue {
    @Prop() marker!: Ward;
    @Prop() object!: string;

    account!: Account;
    map: any;
    tb: any;
    mesh: any;

    created() {
        const THREE = (window as any)['THREE'];
        const loader = new THREE.GLTFLoader();

        loader.load('./objects/items/ward.gltf', (gltf: any) => {
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            gltf.scene.userData = {
                id: this.marker.id,
                position: this.marker.position,
            };

            this.mesh = this.tb
                .Object3D({ obj: gltf.scene, units: 'meters' })
                .setCoords([this.marker.position.lng, this.marker.position.lat]);
            this.mesh.rotation.z = Math.floor(Math.random() * 360);

            this.tb.add(this.mesh);
            this.tb.repaint();

            this.$watch('marker.selected', () => {
                return this.remove();
            });
        });
    }

    render() {
        return;
    }

    async remove() {
        await this.$store.dispatch('map/removeWard', { account: this.account, marker: this.marker });
    }

    destroyed() {
        this.tb.remove(this.mesh);
        this.tb.repaint();
    }

    onClick() {
        this.map.setCenter([this.marker.position.lng, this.marker.position.lat]);
    }
}
